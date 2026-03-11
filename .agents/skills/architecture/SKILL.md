# Architecture Skill

## Purpose
Core system design and architecture skill. Provides architectural patterns, decision frameworks, and design principles for building scalable systems.

## Aliases & Redirects
This skill acts as a facade/aggregator for:
- `architecture-patterns` - Implementation patterns
- `architecture-decision-records` - ADR documentation
- `microservices-patterns` - Distributed systems
- `api-design-principles` - API architecture
- `cqrs-implementation` - CQRS pattern
- `saga-orchestration` - Distributed transactions
- `event-store-design` - Event sourcing
- `projection-patterns` - Read model patterns
- `database-migration` - Data architecture
- `postgresql-table-design` - Database design

## When to Use
Use this skill for:
- System design and architecture planning
- Technology selection and evaluation
- Scalability and performance planning
- Integration pattern design
- Data modeling and database design
- API design and contract definition
- Microservices architecture planning
- Event-driven system design

## Architecture Principles
1. **Separation of Concerns** - Clear boundaries between components
2. **Single Responsibility** - Each component does one thing well
3. **Loose Coupling** - Minimal dependencies between components
4. **High Cohesion** - Related functionality grouped together
5. **Design for Change** - Anticipate and accommodate evolution
6. **YAGNI** - You Ain't Gonna Need It (avoid over-engineering)

## Architecture Styles Supported
- **Monolithic** - Single deployment unit
- **Microservices** - Distributed, independently deployable services
- **Event-Driven** - Asynchronous, event-based communication
- **Serverless** - Function-as-a-service, event-driven
- **Layered** - Presentation → Business → Data layers
- **Hexagonal** - Ports and adapters, dependency inversion
- **Clean Architecture** - Separation of concerns, testability

## Success Metrics
- System meets scalability requirements
- Components are appropriately decoupled
- Changes can be made with minimal ripple effects
- Performance meets SLA requirements
- System is maintainable and evolvable
- Team can work independently on components

## Related Skills
- `planning` - For architecture planning
- `coding` - For implementation
- `testing` - For architecture validation
- `security` - For security architecture
- `performance` - For performance considerations