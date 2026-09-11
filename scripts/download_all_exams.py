import os
import sys
import re
import time
import json
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

CATEGORIES = {
    '고1': 'https://horaeng.com/category/%ea%b3%a01%20%eb%aa%a8%ec%9d%98%ea%b3%a0%ec%82%ac',
    '고2': 'https://horaeng.com/category/%ea%b3%a02%20%eb%aa%a8%ec%9d%98%ea%b3%a0%ec%82%ac',
    '고3': 'https://horaeng.com/category/%ea%b3%a03%20%eb%aa%a8%ec%9d%98%ea%b3%a0%ec%82%ac'
}

def log(msg):
    try:
        print(msg, flush=True)
    except Exception:
        print(msg.encode('ascii', errors='backslashreplace').decode('ascii'), flush=True)

def get_soup(url):
    # safe quote URL
    parsed = urllib.parse.urlsplit(url)
    # 이미 % 인코딩된 것 decode 후 quote
    decoded_path = urllib.parse.unquote(parsed.path)
    encoded_path = urllib.parse.quote(decoded_path)
    safe_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment))

    req = urllib.request.Request(safe_url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=25) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        return BeautifulSoup(html, 'html.parser')

def download_file(url, target_path):
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1000:
        return True, 'Already exists'

    parsed = urllib.parse.urlsplit(url)
    decoded_path = urllib.parse.unquote(parsed.path)
    encoded_path = urllib.parse.quote(decoded_path)
    safe_url = urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, encoded_path, parsed.query, parsed.fragment))

    req = urllib.request.Request(safe_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            content = resp.read()
            if len(content) < 500:
                return False, 'Content too small (likely error)'
            with open(target_path, 'wb') as f:
                f.write(content)
            return True, f'Downloaded ({len(content)} bytes)'
    except Exception as e:
        return False, str(e)

def sanitize(name):
    return re.sub(r'[\\/*?:"<>|–—\s]+', '_', name).strip('_')

def main():
    base_dir = os.path.join(os.getcwd(), 'data', 'exam_pdfs')
    os.makedirs(base_dir, exist_ok=True)
    report_file = os.path.join(base_dir, 'download_report.json')

    report_data = {'고1': [], '고2': [], '고3': []}

    for grade, cat_url in CATEGORIES.items():
        grade_dir = os.path.join(base_dir, grade)
        os.makedirs(grade_dir, exist_ok=True)

        log(f"\n==========================================")
        log(f"[{grade}] 모의고사 수집 시작")
        log(f"==========================================")

        all_posts = []
        page = 1
        while True:
            url = cat_url if page == 1 else f"{cat_url}/page/{page}"
            log(f"  [{grade}] 카테고리 페이지 {page} 탐색 중...")
            try:
                soup = get_soup(url)
                page_found = 0
                for a in soup.find_all('a'):
                    href = a.get('href', '')
                    t = a.get_text().strip()
                    if href and 'horaeng.com/' in href and 'category' not in href:
                        if ('모의고사' in t or '수능' in t or '모의평가' in t) and re.search(r'202[0-9]', t):
                            if not any(p['url'] == href for p in all_posts):
                                all_posts.append({'title': t, 'url': href})
                                page_found += 1
                if page_found == 0:
                    break
                page += 1
                if page > 10:
                    break
            except Exception as e:
                log(f"  [{grade}] 페이지 {page} 탐색 종료 ({e})")
                break

        log(f"[{grade}] 총 {len(all_posts)}개 시험 회차 포스트 발견! 각 포스트의 영어 PDF 다운로드 시작...")

        for idx, post in enumerate(all_posts, 1):
            p_title = post['title']
            p_url = post['url']

            # 연도 및 회차 파악
            y_m = re.search(r'(202[0-9])', p_title)
            year = y_m.group(1) if y_m else '기타'
            m_m = re.search(r'([0-9]{1,2})월|수능', p_title)
            month = m_m.group(0) if m_m else '시험'

            log(f"  ({idx}/{len(all_posts)}) {year}년 {month} [{p_title[:35]}]")

            try:
                soup = get_soup(p_url)
                links = soup.find_all('a')
                for a in links:
                    href = a.get('href', '')
                    txt = a.get_text().strip()
                    parent_txt = a.parent.get_text() if a.parent else ''
                    context = f"{txt} {parent_txt} {href}"

                    if 'pdf' in href.lower() and ('영어' in context or '듣기' in context):
                        f_type = '문제'
                        if '해설' in context:
                            f_type = '해설'
                        elif '듣기' in context or '대본' in context:
                            f_type = '듣기대본'
                        elif '정답' in context or '답' in context:
                            f_type = '정답'

                        fname = f"{year}_{month}_{grade}_영어_{f_type}.pdf"
                        target_file = os.path.join(grade_dir, fname)

                        ok, msg = download_file(href, target_file)
                        status_str = "OK" if ok else "FAIL"
                        log(f"     [{status_str}] {fname} -> {msg}")

                        report_data[grade].append({
                            'year': year,
                            'month': month,
                            'type': f_type,
                            'filename': fname,
                            'path': target_file,
                            'status': 'success' if ok else 'failed',
                            'url': href
                        })
                time.sleep(0.2)
            except Exception as ex:
                log(f"     [ERROR] {p_url}: {ex}")

    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    total_files = sum(len([x for x in v if x['status'] == 'success']) for v in report_data.values())
    log(f"\n==========================================")
    log(f"모든 학년(고1, 고2, 고3) 다운로드 완료!")
    log(f"총 다운로드 성공 파일: {total_files}개")
    log(f"저장 폴더: {base_dir}")
    log(f"==========================================")

if __name__ == '__main__':
    main()
