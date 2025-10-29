# GitHub 項目安全檢查報告

**檢查日期**: 2025-01-28
**項目**: zwds (https://github.com/cka4913/zwds)
**檢查結果**: ✅ 整體安全良好，有幾項建議改進

---

## 🔍 安全檢查結果

### ✅ 良好項目

1. **`.gitignore` 配置完善**
   - ✅ 已正確排除 `node_modules/`
   - ✅ 已排除 `.wrangler` 和 `.dev.vars`（Cloudflare Workers 敏感文件）
   - ✅ 已排除開發文件（`.claude/`, `CLAUDE.md`, `PHASE*.md` 等）
   - ✅ 已排除構建產物（`dist/`, `*.tsbuildinfo`, `coverage/`）
   - ✅ 已排除日誌文件（`*.log`）

2. **無敏感信息洩露**
   - ✅ Git 歷史中未發現敏感文件（passwords, secrets, tokens, credentials）
   - ✅ `wrangler.toml` 中僅包含基本配置，無 API keys
   - ✅ 無 `.env` 文件被提交

3. **GitHub Actions 配置安全**
   - ✅ CI workflow 使用官方 actions（`actions/checkout@v4`, `pnpm/action-setup@v3`）
   - ✅ 無硬編碼的密鑰或憑證

4. **測試數據已脫敏**
   - ✅ 測試數據已從 1984-09-19 改為 2000-01-01（通用範例日期）

---

## ⚠️ 建議改進項目

### 1. 增強 `.gitignore`

建議添加以下內容到 `.gitignore`：

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development

# Secrets and credentials
*.key
*.pem
*.crt
*.cer
*.p12
secrets.json
credentials.json

# Local configuration
config.local.*
```

### 2. 創建 `SECURITY.md`

建議創建安全政策文件，讓用戶知道如何報告安全問題：

```markdown
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email:
- [您的安全聯繫郵箱]

Please do not open public issues for security vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Best Practices

- Never commit API keys, tokens, or passwords
- Use environment variables for sensitive configuration
- Keep dependencies up to date
```

### 3. Cloudflare Workers 安全提示

如果在 `.dev.vars` 中儲存了敏感變量，請確保：
- ✅ `.dev.vars` 已在 `.gitignore` 中（已完成）
- 📝 創建 `.dev.vars.example` 模板文件（但不包含實際值）

範例：
```bash
# .dev.vars.example
# Copy this file to .dev.vars and fill in your actual values

# API_KEY=your_api_key_here
# SECRET_TOKEN=your_secret_token_here
```

---

## 📋 GitHub Repository 安全設置建議

### 一、基本設置（Settings → General）

1. **Features** 區域：
   - ✅ 啟用 **Issues**（已啟用，用於 bug 報告）
   - ✅ 啟用 **Discussions**（可選，社區討論）
   - ❌ 關閉 **Wiki**（除非需要，減少攻擊面）
   - ❌ 關閉 **Projects**（除非需要）

2. **Pull Requests** 區域：
   - ✅ 啟用 **Allow squash merging**
   - ✅ 啟用 **Allow merge commits**
   - ✅ 啟用 **Allow rebase merging**
   - ✅ 啟用 **Automatically delete head branches**（合併後自動刪除分支）

3. **Danger Zone** 區域：
   - ⚠️ 確認項目可見性設置正確（Public/Private）

### 二、分支保護規則（Settings → Branches）

建議為 `main` 分支設置保護規則：

1. **Branch protection rules** → 點擊 **Add rule**

2. **Branch name pattern**: `main`

3. **建議啟用的規則**：
   ```
   ✅ Require a pull request before merging
      ✅ Require approvals (至少 1 個)
      ✅ Dismiss stale pull request approvals when new commits are pushed

   ✅ Require status checks to pass before merging
      ✅ Require branches to be up to date before merging
      ✅ Status checks to require: ci (GitHub Actions)

   ✅ Require conversation resolution before merging

   ✅ Do not allow bypassing the above settings
   ```

### 三、Code Security（Settings → Security）

#### 1. **Dependency Graph**
路徑：Settings → Security → Code security and analysis

- ✅ 啟用 **Dependency graph**
  - 自動追蹤項目依賴

#### 2. **Dependabot Alerts**
- ✅ 啟用 **Dependabot alerts**
  - 當依賴有安全漏洞時自動通知

- ✅ 啟用 **Dependabot security updates**
  - 自動創建 PR 修復安全漏洞

#### 3. **Dependabot Version Updates**
創建 `.github/dependabot.yml`：

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automerge"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
```

#### 4. **Code Scanning (CodeQL)**
路徑：Settings → Security → Code security and analysis

- ✅ 啟用 **Code scanning**
  - 點擊 **Set up** → **Advanced**
  - 使用 GitHub 提供的 CodeQL workflow

創建 `.github/workflows/codeql.yml`：

```yaml
name: "CodeQL"

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 0 * * 1'  # 每週一執行

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

#### 5. **Secret Scanning**
- ✅ 啟用 **Secret scanning**（GitHub 會自動掃描 tokens, keys）
- ✅ 啟用 **Push protection**（防止推送包含密鑰的提交）

### 四、Access Control（Settings → Collaborators）

1. **Repository access**：
   - 只給需要的人員添加寫入權限
   - 考慮使用 Team 管理權限（組織級別）

2. **Permission levels**：
   - **Read**: 只能查看
   - **Triage**: 可以管理 issues
   - **Write**: 可以推送代碼
   - **Maintain**: 可以管理設置（不含敏感操作）
   - **Admin**: 完全權限

### 五、環境保護（Settings → Environments）

如果使用 GitHub Actions 部署到 Cloudflare Workers：

1. 創建 **Environment**: `production`

2. **Environment protection rules**：
   - ✅ **Required reviewers**（需要審核才能部署）
   - ✅ **Wait timer**（部署前等待時間）

3. **Environment secrets**：
   - 添加 `CLOUDFLARE_API_TOKEN`（用於部署）
   - 不要在代碼中硬編碼

### 六、Webhooks 和 Integrations

路徑：Settings → Webhooks

- ⚠️ 檢查是否有不明的 webhooks
- ⚠️ 確認所有 integrations 都是可信的

---

## 🛡️ 個人賬號安全建議

### 1. 啟用兩步驟驗證（2FA）

**強烈建議！** 這是最重要的安全措施。

1. 前往：https://github.com/settings/security
2. 點擊 **Two-factor authentication** → **Enable**
3. 選擇方式：
   - **推薦**: 使用 Authenticator App（如 Google Authenticator, Authy）
   - 或使用 SMS（較不安全）
4. **保存 Recovery codes**（非常重要！）

### 2. SSH Keys 管理

路徑：https://github.com/settings/keys

- ✅ 使用 SSH key 而非 HTTPS（更安全）
- ✅ 為不同設備使用不同的 SSH keys
- ✅ 定期檢查並移除不用的 keys
- ✅ 使用 Ed25519 算法（更安全）：
  ```bash
  ssh-keygen -t ed25519 -C "your_email@example.com"
  ```

### 3. Personal Access Tokens

路徑：https://github.com/settings/tokens

- ⚠️ 定期檢查並刪除不用的 tokens
- ✅ 使用 **Fine-grained tokens**（更精細的權限控制）
- ✅ 設置 token 過期時間
- ✅ 只給予必要的權限（最小權限原則）

### 4. 已授權應用檢查

路徑：https://github.com/settings/applications

- ⚠️ 定期檢查 **Authorized OAuth Apps**
- ⚠️ 撤銷不再使用的應用權限

### 5. Sessions 管理

路徑：https://github.com/settings/sessions

- ⚠️ 檢查活動 sessions
- ⚠️ 登出不認識的 sessions

---

## 📝 操作步驟總結

### 立即執行（高優先級）：

1. ✅ **啟用兩步驟驗證（2FA）**
   - https://github.com/settings/security

2. ✅ **啟用 Dependabot Alerts**
   - Settings → Security → Dependabot alerts → Enable

3. ✅ **啟用 Secret Scanning**
   - Settings → Security → Secret scanning → Enable

4. ✅ **檢查已授權應用**
   - https://github.com/settings/applications

### 建議執行（中優先級）：

5. 📝 **創建 `SECURITY.md`**
   - 提供安全報告指南

6. 📝 **設置分支保護規則**
   - Settings → Branches → Add rule for `main`

7. 📝 **創建 `.github/dependabot.yml`**
   - 自動更新依賴

8. 📝 **設置 CodeQL**
   - 創建 `.github/workflows/codeql.yml`

### 可選執行（低優先級）：

9. 📝 **更新 `.gitignore`**
   - 添加更多環境變量和密鑰模式

10. 📝 **創建 `.dev.vars.example`**
    - Cloudflare Workers 環境變量模板

---

## 🔗 相關資源

- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [Securing your repository](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [About Dependabot security updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)
- [About code scanning](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning)

---

## ✅ 最終檢查清單

- [ ] 啟用兩步驟驗證（2FA）
- [ ] 啟用 Dependabot Alerts
- [ ] 啟用 Secret Scanning
- [ ] 設置 main 分支保護規則
- [ ] 創建 SECURITY.md
- [ ] 創建 .github/dependabot.yml
- [ ] 設置 CodeQL code scanning
- [ ] 檢查並清理已授權應用
- [ ] 檢查 Personal Access Tokens
- [ ] 更新 .gitignore（添加環境變量模式）

---

**建議**: 將此檢查清單每 3-6 個月重新檢查一次，確保項目安全性持續維護。
