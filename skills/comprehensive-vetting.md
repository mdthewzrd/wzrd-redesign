# WZRD.dev Comprehensive Skills Vetting

**Date**: March 5, 2026
**Goal**: Reduce 166 skills to essential, non-redundant core (~60-80 skills)
**Stack**: TypeScript/JavaScript, Node.js, Browser Automation

---

## 🎯 KEEPING (Essential Skills - ~65 total)

### Browser/Visual (2 skills)
- ✅ **agent-browser** - Essential browser automation for E2E testing, visual validation
- ✅ **electron** - Desktop app automation (if needed)
- ❌ **dogfood** - REMOVE (testing tool with same skills, redundant)

### Product Building - Single Agent Adapted (6 skills)
- ✅ **brainstorming** - Design gatekeeper before implementation
- ✅ **systematic-debugging** - Debug methodology (40.8K, well-tested)
- ✅ **writing-plans** - Implementation planning
- ✅ **executing-plans** - Single-agent task execution (adapt for mode-shifting)
- ✅ **test-driven-development** - TDD methodology
- ✅ **verification-before-completion** - Quality gates

❌ Remove subagent/multi-agent superpowers:
- ❌ **finishing-a-development-branch** - REMOVE (uses git worktrees which spawn contexts)
- ❌ **using-git-worktrees** - REMOVE (multi-context coordination)
- ❌ **receiving-code-review** - REMOVE (subagent-based)
- ❌ **requesting-code-review** - REMOVE (subagent-based)
- ❌ **using-superpowers** - REMOVE (guide, already replaced by docs)

### Frontend/React/Design (12 skills)
- ✅ **vercel-react-best-practices** - Core React patterns (extensive, well-maintained)
- ✅ **vercel-composition-patterns** - Component architecture (complements patterns)
- ✅ **nextjs-app-router-patterns** - Next.js router (if we use Next.js)
- ✅ **react-state-management** - State patterns
- ✅ **react-modernization** - Modernizing legacy React
- ✅ **design-system-patterns** - Design system architecture
- ✅ **tailwind-design-system** - Tailwind patterns
- ✅ **interaction-design** - UX patterns
- ✅ **responsive-design** - Mobile-first design
- ✅ **visual-design-foundations** - Design principles

❌ Remove niche/redundant:
- ❌ **vercel-react-native-skills** - REMOVE (mobile - not our focus)
- ❌ **react-native-architecture** - REMOVE (mobile - not our focus)
- ❌ **react-native-design** - REMOVE (mobile - not our focus)
- ❌ **web-design-guidelines** - REMOVE (redundant with visual-design-foundations)
- ❌ **mobile-android-design** - REMOVE (mobile - not our focus)
- ❌ **mobile-ios-design** - REMOVE (mobile - not our focus)
- ❌ **web-component-design** - REMOVE (niche, not commonly used)

### Architecture/Patterns (8 skills)
- ✅ **architecture-patterns** - Core architecture
- ✅ **architecture-decision-records** - ADR documentation
- ✅ **microservices-patterns** - Microservices (if relevant)
- ❌ **cqrs-implementation** - REMOVE (niche pattern, not commonly needed)
- ❌ **event-store-design** - REMOVE (specific to event sourcing)
- ❌ **saga-orchestration** - REMOVE (specific pattern, not widely used)
- ❌ **projection-patterns** - REMOVE (specific to CQRS)
- ❌ **workflow-orchestration-patterns** - REMOVE (overlaps with workflow-patterns)
- ❌ **workflow-patterns** - REMOVE (too generic, covered by architecture)
- ❌ **task-coordination-strategies** - REMOVE (multi-agent coordination)

### Testing/Debug/Quality (10 skills)
- ✅ **e2e-testing-patterns** - E2E testing
- ✅ **test-driven-development** - TDD methodology (from superpowers)
- ✅ **debugging-strategies** - Debug patterns
- ✅ **systematic-debugging** - Debug methodology (from superpowers)
- ✅ **code-review-excellence** - Code review patterns
- ✅ **verification-before-completion** - Quality gates (from superpowers)
- ✅ **data-quality-frameworks** - Data quality (if relevant)
- ✅ **accessibility-compliance** - Accessibility patterns
- ✅ **wcag-audit-patterns** - WCAG compliance

❌ Remove redundant/low-value:
- ❌ **parallel-debugging** - REMOVE (multi-agent coordination)
- ❌ **bats-testing-patterns** - REMOVE (shell testing, not our focus)
- ❌ **javascript-testing-patterns** - REMOVE (covered by e2e-testing-patterns)
- ❌ **python-testing-patterns** - REMOVE (Python not our focus)
- ❌ **temporal-python-testing** - REMOVE (Python-specific)
- ❌ **multi-reviewer-patterns** - REMOVE (multi-agent coordination)
- ❌ **screen-reader-testing** - REMOVE (specific testing, low frequency)

### TypeScript/JavaScript (5 skills)
- ✅ **typescript-advanced-types** - Advanced TypeScript
- ✅ **modern-javascript-patterns** - Modern JS patterns
- ✅ **nodejs-backend-patterns** - Node.js backend
- ✅ **error-handling-patterns** - Error handling
- ❌ **javascript-testing-patterns** - REDUNDANT (covered in testing category)

### Git/Workflows (4 skills)
- ✅ **git-advanced-workflows** - Git best practices
- ✅ **monorepo-management** - Monorepo patterns
- ✅ **changelog-automation** - Changelog automation
- ❌ **gitops-workflow** - REMOVE (DevOps-specific, not needed for dev)
- ❌ **nx-workspace-patterns** - REMOVE (tool-specific, use general patterns)
- ❌ **turborepo-caching** - REMOVE (tool-specific, use general patterns)

### API (2 skills)
- ✅ **api-design-principles** - API design
- ✅ **openapi-spec-generation** - OpenAPI specs

### LLM/AI/ML (8 skills)
- ✅ **prompt-engineering-patterns** - Prompt engineering (critical for LLMs)
- ✅ **llm-evaluation** - LLM evaluation
- ✅ **langchain-architecture** - LangChain patterns (if using LangChain)
- ✅ **rag-implementation** - RAG patterns
- ✅ **embedding-strategies** - Embedding patterns
- ❌ **hybrid-search-implementation** - REMOVE (specific, low frequency)
- ❌ **similarity-search-patterns** - REMOVE (specific, covered by embedding/rag)
- ❌ **vector-index-tuning** - REMOVE (specific optimization)
- ❌ **ml-pipeline-workflow** - REMOVE (ML-specific, not our focus)

### Security (4 skills)
- ✅ **security-requirement-extraction** - Security requirements
- ✅ **sast-configuration** - Static analysis
- ❌ **threat-mitigation-mapping** - REMOVE (specific, low frequency)
- ❌ **stride-analysis-patterns** - REMOVE (specific methodology, not widely used)

### Performance/Cost (2 skills)
- ✅ **cost-optimization** - Cost management (already have tracker)
- ✅ **prompt-engineering-patterns** - ALSO cost optimization (dual purpose)

### Documentation/Writing (4 skills)
- ✅ **writing-plans** - (from superpowers)
- ✅ **writing-skills** - Technical writing
- ✅ **architecture-decision-records** - ADRs
- ❌ **data-storytelling** - REMOVE (data viz, not our focus)

### Deployment (1 skill)
- ✅ **deployment-pipeline-design** - Deployment patterns

### Databases (2 skills)
- ✅ **postgresql-table-design** - PostgreSQL patterns (if using PG)
- ❌ **sql-optimization-patterns** - REMOVE (specific optimization, low frequency)

---

## 🗑️ REMOVE CATEGORIES ENTIRELY

### Python - REMOVE ALL (14 skills)
**Reason**: We don't use Python heavily. These are Python-specific.

- ❌ python-design-patterns
- ❌ python-anti-patterns
- ❌ python-project-structure
- ❌ python-code-style
- ❌ python-error-handling
- ❌ python-observability
- ❌ python-performance-optimization
- ❌ python-testing-patterns
- ❌ python-type-safety
- ❌ python-packaging
- ❌ python-configuration
- ❌ python-resilience
- ❌ python-resource-management
- ❌ python-background-jobs
- ❌ async-python-patterns

### DevOps/Kubernetes - REMOVE ALL (8 skills)
**Reason**: DevOps/infrastructure focus, not development focus.

- ❌ k8s-manifest-generator
- ❌ k8s-security-policies
- ❌ helm-chart-scaffolding
- ❌ gitops-workflow
- ❌ service-mesh-observability
- ❌ istio-traffic-management
- ❌ linkerd-patterns
- ❌ distributed-tracing

### CI/CD Tools - REMOVE ALL (3 skills)
**Reason**: Tool-specific, not general patterns.

- ❌ github-actions-templates
- ❌ gitlab-ci-patterns
- ❌ terraform-module-library

### Monitoring/Observability - REMOVE ALL (3 skills)
**Reason**: Ops/DevOps focus, not development.

- ❌ prometheus-configuration
- ❌ grafana-dashboards
- ❌ slo-implementation

### Mobile - REMOVE ALL (3 skills)
**Reason**: Not our focus.

- ❌ mobile-android-design
- ❌ mobile-ios-design
- ❌ react-native-architecture (already removed above)

### Crypto/Web3 - REMOVE ALL (3 skills)
**Reason**: Not our focus.

- ❌ defi-protocol-templates
- ❌ nft-standards
- ❌ solidity-security

### Game Development - REMOVE ALL (2 skills)
**Reason**: Not our focus.

- ❌ godot-gdscript-patterns
- ❌ unity-ecs-patterns

### Reverse Engineering - REMOVE ALL (2 skills)
**Reason**: Not our focus / security concern.

- ❌ anti-reversing-techniques
- ❌ protocol-reverse-engineering

### Financial/Startups - REMOVE ALL (3 skills)
**Reason**: Business/finance focus, not development.

- ❌ competitive-landscape
- ❌ market-sizing-analysis
- ❌ startup-financial-modeling

### Employment - REMOVE ALL (1 skill)
**Reason**: Business/HR focus, not development.

- ❌ employment-contract-templates

### Payment Integration - REMOVE ALL (2 skills)
**Reason**: Specific integrations, not general patterns.

- ❌ paypal-integration
- ❌ stripe-integration

### Other Niche/Specific - REMOVE (15+ skills)
**Reason**: Too specific, low frequency.

- ❌ airflow-dag-patterns
- ❌ backtesting-frameworks
- ❌ bazel-build-optimization
- ❌ billing-automation
- ❌ binary-analysis-patterns
- ❌ code-design-patterns
- ❌ context-driven-development
- ❌ dbt-transformation-patterns
- ❌ dotnet-backend-patterns
- ❌ fastapi-templates
- ❌ gdpr-data-handling
- ❌ go-concurrency-patterns
- ❌ hybrid-cloud-networking
- ❌ incident-runbook-templates
- ❌ kpi-dashboard-design
- ❌ memory-forensics
- ❌ memory-safety-patterns
- ❌ ml-pipeline-workflow
- ❌ multi-cloud-architecture
- ❌ on-call-handoff-patterns
- ❌ parallel-feature-development
- ❌ pci-compliance
- ❌ postmortem-writing
- ❌ python-type-safety
- ❌ react-modernization
- ❌ risk-metrics-calculation
- ❌ rust-async-patterns
- ❌ screen-reader-testing
- ❌ shellcheck-configuration
- ❌ slack
- ❌ spark-optimization
- ❌ startup-metrics-framework
- ❌ track-management
- ❌ web3-testing

---

## 📊 Final Count

**Keep**: ~65 skills
**Remove**: ~101 skills (60% reduction)

---

## 🎯 Essential Skills Summary by Category

1. **Browser/Visual**: 2 skills
   - agent-browser, electron

2. **Product Building**: 6 skills
   - brainstorming, systematic-debugging, writing-plans, executing-plans, test-driven-development, verification-before-completion

3. **Frontend/React/Design**: 12 skills
   - vercel patterns, design-system, tailwind, etc.

4. **Architecture/Patterns**: 8 skills
   - architecture-patterns, ADRs, etc.

5. **Testing/Debug/Quality**: 10 skills
   - testing patterns, debugging, code review, etc.

6. **TypeScript/JavaScript**: 5 skills
   - advanced types, modern JS, Node.js, error handling

7. **Git/Workflows**: 4 skills
   - git-advanced-workflows, monorepo-management

8. **API**: 2 skills
   - api-design, OpenAPI

9. **LLM/AI/ML**: 8 skills
   - prompt engineering, LLM evaluation, RAG, embeddings

10. **Security**: 4 skills
    - security requirements, SAST

11. **Performance/Cost**: 2 skills
    - cost optimization, prompt engineering (dual)

12. **Documentation**: 4 skills
    - writing plans, writing skills, ADRs

13. **Deployment**: 1 skill
    - deployment-pipeline-design

14. **Databases**: 2 skills
    - PostgreSQL design

---

**Next Step**: Execute removal of all 101 skills marked for removal.
