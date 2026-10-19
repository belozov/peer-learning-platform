import os
import sys
import re
import requests

TOKEN_PATH = r'C:\Users\QWERTY\Documents\youtrack-token.txt'
BASE_URL = 'https://bekzat-diploma-2027.youtrack.cloud'
PROJECT_KEY = 'PLP'

def main():
    if not os.path.exists(TOKEN_PATH):
        print(f"ERROR: Credentials file not found at {TOKEN_PATH}")
        sys.exit(1)

    with open(TOKEN_PATH, 'r', encoding='utf-8') as f:
        token = f.read().strip()

    if not token:
        print("ERROR: Token file is empty.")
        sys.exit(1)

    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    # 1. Verify Authentication
    try:
        user_res = requests.get(f'{BASE_URL}/api/users/me?fields=id,login,name,guest', headers=headers, timeout=15)
        if user_res.status_code != 200:
            print(f"ERROR: Authentication failed with HTTP status {user_res.status_code}")
            sys.exit(1)
        user_data = user_res.json()
        if user_data.get('guest'):
            print("ERROR: Token authenticated as Guest. Admin/User permissions required.")
            sys.exit(1)
        print(f"SUCCESS: Authenticated as user '{user_data.get('login')}' ({user_data.get('name')})")
    except Exception as e:
        print(f"ERROR: Network connection failed during auth check: {type(e).__name__}")
        sys.exit(1)

    # 2. Check / Resolve Project PLP
    try:
        proj_res = requests.get(f'{BASE_URL}/api/admin/projects?fields=id,name,shortName', headers=headers, timeout=15)
        if proj_res.status_code != 200:
            print(f"ERROR: Failed to list projects (HTTP {proj_res.status_code})")
            sys.exit(1)
        projects = proj_res.json()
        target_project = None
        for p in projects:
            if p.get('shortName', '').upper() == PROJECT_KEY.upper():
                target_project = p
                break

        if not target_project:
            print(f"Project '{PROJECT_KEY}' not found. Attempting to create project '{PROJECT_KEY}'...")
            create_proj_payload = {
                'name': 'Peer Learning Platform',
                'shortName': PROJECT_KEY,
                'description': 'Individual Diploma Project - Development of a compatibility-based peer learning platform'
            }
            create_proj_res = requests.post(f'{BASE_URL}/api/admin/projects', headers=headers, json=create_proj_payload, timeout=15)
            if create_proj_res.status_code in [200, 201]:
                target_project = create_proj_res.json()
                print(f"SUCCESS: Created project '{PROJECT_KEY}' (ID: {target_project.get('id')})")
            else:
                print(f"ERROR: Failed to create project '{PROJECT_KEY}' (HTTP {create_proj_res.status_code}): {create_proj_res.text[:200]}")
                sys.exit(1)
        else:
            print(f"SUCCESS: Resolved project '{target_project.get('name')}' (Key: {target_project.get('shortName')}, ID: {target_project.get('id')})")
    except Exception as e:
        print(f"ERROR: Project resolution failed: {type(e).__name__}")
        sys.exit(1)

    project_id = target_project.get('id')

    # 3. Check existing issues
    existing_issues_map = {}
    try:
        issues_res = requests.get(
            f'{BASE_URL}/api/issues?query=project:{PROJECT_KEY}&fields=id,idReadable,summary',
            headers=headers,
            timeout=15
        )
        if issues_res.status_code == 200:
            for iss in issues_res.json():
                summary = iss.get('summary', '')
                id_readable = iss.get('idReadable', '')
                existing_issues_map[summary] = iss
                existing_issues_map[id_readable] = iss
                m_id = re.match(r'^PLP-(\d+)', id_readable)
                if m_id:
                    num = int(m_id.group(1))
                    existing_issues_map[f"PLP-{num}"] = iss
                    existing_issues_map[f"PLP-{num:02d}"] = iss
                m_sum = re.match(r'^PLP-(\d+)', summary)
                if m_sum:
                    num = int(m_sum.group(1))
                    existing_issues_map[f"PLP-{num}"] = iss
                    existing_issues_map[f"PLP-{num:02d}"] = iss
            print(f"Found {len(issues_res.json())} existing issues in project '{PROJECT_KEY}'")
        else:
            print(f"WARNING: Could not query existing issues (HTTP {issues_res.status_code})")
    except Exception as e:
        print(f"WARNING: Exception querying issues: {type(e).__name__}")

    # 4. Parse the 22 tasks from docs/youtrack-tasks.md
    tasks_md_path = os.path.abspath('docs/youtrack-tasks.md')
    with open(tasks_md_path, 'r', encoding='utf-8') as f:
        tasks_content = f.read()

    task_rows = []
    # Match markdown table rows: | [**PLP-x**](link) | Task Title | Priority | Deadline | Dependencies | Status | Expected Outcome | Artifact / Ref |
    pattern = r'\|\s*(?:\[)?\*\*(PLP-\d+)\*\*(?:\]\([^)]+\))?\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|'
    for match in re.finditer(pattern, tasks_content):
        t_id, title, priority, deadline, deps, status, outcome, artifact = [m.strip() for m in match.groups()]
        task_rows.append({
            'task_id': t_id,
            'title': title,
            'priority': priority,
            'deadline': deadline,
            'deps': deps,
            'status': status,
            'outcome': outcome,
            'artifact': artifact
        })

    print(f"Parsed {len(task_rows)} milestone tasks from docs/youtrack-tasks.md")

    # 5. Execute Import
    created = []
    existing = []
    failed = []

    for t in task_rows:
        t_id = t['task_id']
        summary = f"{t_id}: {t['title']}"

        # Check if already exists
        if t_id in existing_issues_map or summary in existing_issues_map:
            match_iss = existing_issues_map.get(t_id) or existing_issues_map.get(summary)
            id_readable = match_iss.get('idReadable')
            link = f"{BASE_URL}/issue/{id_readable}"
            existing.append({'task_id': t_id, 'idReadable': id_readable, 'summary': summary, 'link': link})
            print(f"[EXISTING] {t_id} -> {id_readable} ({link})")
            continue

        desc = (
            f"**Task ID**: {t_id}\n"
            f"**Priority**: {t['priority']}\n"
            f"**Milestone Deadline**: {t['deadline']}\n"
            f"**Dependencies**: {t['deps']}\n"
            f"**Current Status**: {t['status']}\n\n"
            f"### Expected Outcome & Acceptance Criteria\n"
            f"{t['outcome']}\n\n"
            f"### Primary Artifact / Reference\n"
            f"`{t['artifact']}`\n"
        )

        payload = {
            'project': {'id': project_id},
            'summary': summary,
            'description': desc
        }

        try:
            create_res = requests.post(f'{BASE_URL}/api/issues?fields=id,idReadable,summary', headers=headers, json=payload, timeout=15)
            if create_res.status_code in [200, 201]:
                new_iss = create_res.json()
                id_readable = new_iss.get('idReadable')
                link = f"{BASE_URL}/issue/{id_readable}"
                created.append({'task_id': t_id, 'idReadable': id_readable, 'summary': summary, 'link': link})
                print(f"[CREATED] {t_id} -> {id_readable} ({link})")
            else:
                failed.append({'task_id': t_id, 'error': f"HTTP {create_res.status_code}: {create_res.text[:100]}"})
                print(f"[FAILED] {t_id} -> HTTP {create_res.status_code}")
        except Exception as e:
            failed.append({'task_id': t_id, 'error': f"{type(e).__name__}: {str(e)}"})
            print(f"[ERROR] {t_id} -> {type(e).__name__}")

    print("\n" + "="*70)
    print("YOUTRACK IMPORT SUMMARY:")
    print(f"Total Tasks: {len(task_rows)}")
    print(f"Created: {len(created)}")
    print(f"Existing: {len(existing)}")
    print(f"Failed: {len(failed)}")
    print("="*70)

    # Save mapping for documentation update
    all_mapped = created + existing
    all_mapped.sort(key=lambda x: int(x['task_id'].split('-')[1]))
    
    with open('scripts/youtrack_issue_map.json', 'w', encoding='utf-8') as out_f:
        import json
        json.dump(all_mapped, out_f, indent=2)

if __name__ == '__main__':
    main()
