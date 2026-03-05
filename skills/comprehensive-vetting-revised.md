# WZRD.dev Skills Vetting - REVISED with Python & DevOps

**Date**: March 5, 2026 (Revised)
**Goal**: Reduce 166 skills to essential core while maintaining multi-language capability

---

## 🔄 Key Revisions

### 1. Keep Python Skills
**Reason**: User has a Python-focused agent in the project. Development agent should handle main coding languages.

### 2. Re-evaluate DevOps Skills
**Reason**: User questions why we don't need DevOps. Let me explain:

**What DevOps Skills Provide**:
- CI/CD pipeline setup (GitHub Actions, GitLab CI)
- Deployment workflows and infrastructure
- Container configuration (Docker, K8s)
- Configuration management (Terraform)

**Why We Might NOT Need It**:
- Development focus vs operations focus
- You may have separate DevOps/infrastructure work
- Skills might be tool-specific (GitHub Actions templates)

**Why We MIGHT Need It**:
- Setting up deployments for agents
- CI/CD for testing and deployment
- Infrastructure for WZRD.dev platform development
- Even developers help with deployment workflows

Let me re-evaluate specific DevOps skills and KEEP the most valuable, general ones.

---

## 🎯 REVISED Keep List (~80 skills total)

### Browser/Visual (1 skill)
- ✅ **agent-browser** - Main browser automation (Vercel Labs)

### Product Building (6 skills)
- ✅ **brainstorming**
- ✅ **systematic-debugging**
- ✅ **writing-plans**
- ✅ **executing-plans** (adapt for mode-shifting)
- ✅ **test-driven-development**
- ✅ **verification-before-completion**

### Frontend/React/Design (9 skills)
- ✅ **vercel-react-best-practices**
- ✅ **vercel-composition-patterns**
- ✅ **nextjs-app-router-patterns**
- ✅ **design-system-patterns**
- ✅ **tailwind-design-system**
- ✅ **interaction-design**
- ✅ **responsive-design**
- ✅ **visual-design-foundations**

❌ Remove mobile-specific:
- ❌ **vercel-react-native-skills**
- ❌ **mobile-android-design**
- ❌ **mobile-ios-design**
- ❌ **react-native-design**
- ❌ **react-native-architecture**
- ❌ **web-component-design**

### TypeScript/JavaScript (5 skills)
- ✅ **typescript-advanced-types**
- ✅ **modern-javascript-patterns**
- ✅ **nodejs-backend-patterns**
- ✅ **error-handling-patterns**
- ✅ **react-state-management**

### Python (14 skills) - NOW KEEPING
- ✅ **python-design-patterns**
- ✅ **python-anti-patterns**
- ✅ **python-project-structure**
- ✅ **python-code-style**
- ✅ **python-error-handling**
- ✅ **python-observability**
- ✅ **python-performance-optimization**
- ✅ **python-testing-patterns**
- ✅ **python-type-safety**
- ✅ **python-packaging**
- ✅ **python-configuration**
- ✅ **python-resilience**
- ✅ **python-resource-management**
- ✅ **python-background-jobs**
- ✅ **async-python-patterns**

**Reason**: User has Python-focused agent, should handle main languages.

### Architecture/Patterns (6 skills)
- ✅ **architecture-patterns**
- ✅ **architecture-decision-records**
- ✅ **microservices-patterns**

❌ Remove niche patterns:
- ❌ **cqrs-implementation**
- ❌ **event-store-design**
- ❌ **saga-orchestration**
- ❌ **projection-patterns**
- ❌ **workflow-patterns**
- ❌ **task-coordination-strategies**

### Testing/Debug/Quality (8 skills)
- ✅ **e2e-testing-patterns**
- ✅ **test-driven-development**
- ✅ **debugging-strategies**
- ✅ **systematic-debugging**
- ✅ **code-review-excellence**
- ✅ **verification-before-completion**
- ✅ **accessibility-compliance**
- ✅ **wcag-audit-patterns**

❌ Remove redundant/low-value:
- ❌ **bats-testing-patterns**
- ❌ **javascript-testing-patterns** (covered by e2e)
- ❌ **parallel-debugging**, **multi-reviewer-patterns** (multi-agent)

### Git/Workflows (3 skills)
- ✅ **git-advanced-workflows**
- ✅ **monorepo-management**
- ✅ **changelog-automation**

❌ Remove tool-specific:
- ❌ **gitops-workflow**
- ❌ **nx-workspace-patterns**
- ❌ **turborepo-caching**

### DevOps/Deployment (6 skills) - KEEPING VALUABLE ONES
- ✅ **deployment-pipeline-design** - General deployment patterns
- ✅ **github-actions-templates** - Most common CI/CD
- ✅ **shellcheck-configuration** - Shell script linting
- ✅ **secrets-management** - Security best practices

❌ Remove tool-specific/niche:
- ❌ **gitlab-ci-patterns** (less common)
- ❌ **terraform-module-library** (tool-specific)
- ❌ **helm-chart-scaffolding** (K8s-specific)
- ❌ **k8s-manifest-generator** (K8s-specific)
- ❌ **k8s-security-policies** (K8s-specific)
- ❌ **gitops-workflow** (too specific)

### Databases (3 skills)
- ✅ **postgresql-table-design**
- ✅ **sql-optimization-patterns** (useful for performance)

❌ Remove event-sourcing specific:
- ❌ **cqrs-implementation**, **event-store-design**, **projection-patterns**

### LLM/AI/ML (7 skills)
- ✅ **prompt-engineering-patterns**
- ✅ **llm-evaluation**
- ✅ **rag-implementation**
- ✅ **embedding-strategies**

❌ Remove specific:
- ❌ **langchain-architecture** (framework-specific)
- ❌ **hybrid-search-implementation**
- ❌ **similarity-search-patterns**
- ❌ **vector-index-tuning**
- ❌ **ml-pipeline-workflow**

### Security (4 skills)
- ✅ **security-requirement-extraction**
- ✅ **sast-configuration**
- ✅ **prometheus-configuration** (monitoring for security)
- ✅ **secrets-management** (already listed in DevOps)

❌ Remove specific:
- ❌ **threat-mitigation-mapping**
- ❌ **stride-analysis-patterns**

### API (2 skills)
- ✅ **api-design-principles**
- ✅ **openapi-spec-generation**

### Documentation/Writing (3 skills)
- ✅ **writing-plans** (from superpowers)
- ✅ **writing-skills**
- ✅ **architecture-decision-records**

❌ Remove:
- ❌ **data-storytelling**

### Performance/Cost (2 skills)
- ✅ **cost-optimization**
- ✅ **prompt-engineering-patterns** (dual purpose)

---

## 🗑️ REMOVE CATEGORIES ENTIRELY (~76 skills)

### Mobile (3 skills)
- ❌ **mobile-android-design**
- ❌ **mobile-ios-design**
- ❌ **react-native-architecture**, **react-native-design**

### Crypto/Web3 (3 skills)
- ❌ **defi-protocol-templates**
- ❌ **nft-standards**
- ❌ **solidity-security**

### Game Development (2 skills)
- ❌ **godot-gdscript-patterns**
- ❌ **unity-ecs-patterns**

### Reverse Engineering (2 skills)
- ❌ **anti-reversing-techniques**
- ❌ **protocol-reverse-engineering**

### Financial/Startups (3 skills)
- ❌ **competitive-landscape**
- ❌ **market-sizing-analysis**
- ❌ **startup-financial-modeling**
- ❌ **startup-metrics-framework**

### Employment (1 skill)
- ❌ **employment-contract-templates**

### Payment Integration (2 skills)
- ❌ **paypal-integration**
- ❌ **stripe-integration**

### K8s/Service Mesh (4 skills)
- ❌ **istio-traffic-management**
- ❌ **linkerd-patterns**
- ❌ **service-mesh-observability**)
- ❌ **distributed-tracing** (maybe - ops-focused)

### Monitoring/Observability (3 skills)
- ❌ **prometheus-configuration** (keeping instead for security)
- ❌ **grafana-dashboards**
- ❌ **slo-implementation**

### Niche/Specific (~50 skills)
**Reason**: Too specific, low frequency, or redundant:
- airflow-dag-patterns
- backtesting-frameworks
- bazel-build-optimization
- billing-automation
- binary-analysis-patterns
- context-driven-development
- data-quality-frameworks
- dbt-transformation-patterns
- dotnet-backend-patterns
- fastapi-templates
- gdpr-data-handling
- go-concurrency-patterns
- hybrid-cloud-networking
- incident-runbook-templates
- kpi-dashboard-design
- memory-forensics
- memory-safety-patterns
- multi-cloud-architecture
- on-call-handoff-patterns
- parallel-feature-development
- pci-compliance
- postmortem-writing
- react-modernization
- risk-metrics-calculation
- rust-async-patterns
- screen-reader-testing
- slack
- spark-optimization
- track-management
- web3-testing

---

## 📊 Final Count

**Keep**: ~90 skills (increased from ~65 due to Python + DevOps)
**Remove**: ~76 skills (46% reduction)

---

## 🎯 Essential Skills Summary

1. **Browser/Visual**: 1 skill (agent-browser)
2. **Product Building**: 6 skills
3. **Frontend/React/Design**: 9 skills
4. **TypeScript/JavaScript**: 5 skills
5. **Python**: 14 skills (NEW - keeping for Python-focused agent)
6. **Architecture/Patterns**: 6 skills
7. **Testing/Debug/Quality**: 8 skills
8. **Git/Workflows**: 3 skills
9. **DevOps/Deployment**: 6 skills (NEW - keeping valuable ones)
10. **Databases**: 3 skills
11. **LLM/AI/ML**: 7 skills
12. **Security**: 4 skills
13. **API**: 2 skills
14. **Documentation**: 3 skills
15. **Performance/Cost**: 2 skills

---

## 📝 Next Steps

Ready to execute removals of ~76 skills marked for removal.

**What do you think about:**
1. ✅ Keeping Python skills (for your Python agent)
2. ✅ Keeping key DevOps skills (deployment, GitHub Actions, secrets)
3. ❌ Removing niche categories (mobile, crypto, game dev, reverse engineering)
4. ✅ Removing redundant/low-value individual skills

**Approve and I'll execute the removals!**
