---
name: code-craftsman
description: "Generate production-grade code that survives contact with real users. Enforces clean architecture, type safety, error handling, observability, and security defaults. Use when writing any new module, refactoring existing code, or pulling off-the-cuff code into a deployable artifact."
version: 1.0.0
author: Kiro
license: MIT
---

# Code Craftsman

Every line you write either earns its place or it gets rewritten at 3 AM. This skill enforces the practices that distinguish shipping code from sample code.

## When to Use

- Writing a new service, module, or feature
- Refactoring existing code toward production
- Pulling in a proof-of-concept into a deployable artifact
- Reviewing AI-generated code before it lands
- Onboarding into a codebase that "we'll clean up later" (it's now later)

## The Eleven Production Standards

### 1. Strict Type Boundaries

No `any`, no `interface{}`, no dynamic shapes crossing module boundaries.

```go
// BAD: stringly-typed config
func Init(name string) { ... }

// GOOD: typed config with validation
type AgentConfig struct {
    Role            string  `validate:"required,min=2"`
    Goal            string  `validate:"required"`
    Backstory       string
    LLM             LLMClient `validate:"required"`
    MaxIterations   int       `validate:"min=1,max=100"`
}
func NewAgent(cfg AgentConfig) (*Agent, error) {
    if err := validate.Struct(cfg); err != nil {
        return nil, fmt.Errorf("invalid config: %w", err)
    }
    ...
}
```

### 2. Errors Are Values, With Context

Wrap errors with their origin. Never swallow. Never log-and-continue silently.

```go
// BAD
result, _ := db.Query(...)

// BAD (but common)
result, err := db.Query(...)
if err != nil {
    return err
}

// GOOD
result, err := db.Query(ctx, ...)
if err != nil {
    return fmt.Errorf("query users table for tenant %s: %w", tenantID, err)
}
```

Sentinel errors for callers to match on:

```go
var (
    ErrAgentTimeout    = errors.New("agent timed out")
    ErrContextCanceled = errors.New("context canceled")
    ErrValidationFail  = errors.New("validation failed")
)

if errors.Is(err, ErrAgentTimeout) {
    // retry with longer timeout or different model
}
```

### 3. Context Propagation

Every blocking call accepts `context.Context`. Cancellation must flow.

```go
// BAD
func (a *Agent) Run() (Result, error)

// GOOD
func (a *Agent) Run(ctx context.Context) (Result, error) {
    select {
    case <-ctx.Done():
        return Result{}, ctx.Err()
    default:
    }
    // ...all downstream calls take ctx
}
```

### 4. Structured Logging With Trace IDs

Never `log.Println("something happened")`. Log with fields and request-scoped trace IDs.

```go
logger := slog.With("trace_id", traceID, "agent_role", a.Role)
logger.Info("executing task", "task_id", task.ID, "iter", n)
```

### 5. Graceful Shutdown

Servers must drain. Workers must finish in-flight. Connections must close cleanly.

```go
ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGTERM, syscall.SIGINT)
defer cancel()

srv := &http.Server{Addr: ":8080", Handler: mux}
go srv.ListenAndServe()

<-ctx.Done()
shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
if err := srv.Shutdown(shutdownCtx); err != nil {
    logger.Error("graceful shutdown failed", "err", err)
}
```

### 6. Resource Limits

CPU, memory, requests-per-second, goroutine count — every bounded resource must declare its limit.

```go
type SandboxConfig struct {
    CPULimit    string        // "0.5"
    MemoryLimit string        // "512m"
    Timeout     time.Duration // 30s
    NetworkNone bool          // true: no external calls
}

var GlobalLimiter = rate.NewLimiter(rate.Limit(60), 120) // 60 rps, burst 120
```

### 7. Idempotency Where It Matters

Side-effect operations must be safe to retry. Use idempotency keys.

```go
type PaymentRequest struct {
    IdempotencyKey string `json:"idempotency_key"` // UUID v4
    Amount         int64  `json:"amount_cents"`
    Currency       string `json:"currency"`
}
```

### 8. Observability Hooks

Every significant action emits a metric or trace.

```go
defer func(start time.Time) {
    metrics.RecordLatency("agent.run.duration", time.Since(start), a.Labels())
}(time.Now())
```

### 9. Defensive Input Handling

Trim, normalize, validate. Never trust the caller, even if it's "your own service."

```go
func parseRole(s string) (string, error) {
    s = strings.TrimSpace(s)
    if len(s) < 2 || len(s) > 100 {
        return "", fmt.Errorf("role length %d outside [2,100]", len(s))
    }
    return s, nil
}
```

### 10. Concurrency Discipline

Goroutines are cheap. Goroutine leaks are not. Always know your exit.

```go
ctx, cancel := context.WithCancel(parentCtx)
defer cancel()

var wg sync.WaitGroup
for _, t := range tasks {
    wg.Add(1)
    go func(t Task) {
        defer wg.Done()
        if err := process(ctx, t); err != nil {
            errCh <- err
            cancel() // signal others to stop
        }
    }(t)
}
wg.Wait()
close(errCh)
```

### 11. Tests Are Part of the Code

No "we'll add tests later." Tests ship with the feature.

- Unit tests for the happy path AND every error branch
- Integration tests for cross-module behavior
- E2E or smoke tests for the user-facing flow
- Benchmarks for any code you claim is "fast"

## The Anti-Patterns Audit

Before committing code, run this checklist:

```bash
# 1. Unchecked errors (Go)
# Install errcheck: go install github.com/kisielk/errcheck@latest
errcheck ./...

# 2. Type-safety violations
# TypeScript: tsc --noEmit
# Go: go vet ./...

# 3. Dead code
# Go: staticcheck ./...
# TS: ts-prune

# 4. Hardcoded secrets
grep -rE "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][a-zA-Z0-9]{16,}['\"]" --include="*.go" --include="*.{ts,tsx,js,jsx}" .

# 5. Goroutine leaks
# Install goleak: go install go.uber.org/goleak@latest
defer goleak.VerifyTestMain(m)

# 6. TODOs without context
grep -rn "TODO\|FIXME\|XXX" --include="*.go" | head -20
```

## Output Template

When this skill generates code, the output is structured:

```go
// Package comment with usage example
// Function comment with:
//   - what it does
//   - what errors it returns
//   - what context-cancellation means here
// Implementation: types -> validation -> business logic -> I/O
```

## Reference Codebases

Read these before writing any new module:

- `gocrewwai/pkg/agents/agent.go` — clean Go: context, error wrapping, validation
- `gocrewwai/pkg/llm/middleware.go` — middleware composition
- `gocrewwai/pkg/server/server.go` — production HTTP server with graceful shutdown
- `gocrewwai/pkg/flows/engine.go` — typed state machine

## Don't Do These

❌ `panic` for control flow
❌ `time.Sleep` to "make sure something happens"
❌ Global mutable state with no lock
❌ Mixing sync and async without clear boundaries
❌ Catching all exceptions and continuing
❌ Logging secrets (even at debug level)
❌ Configuration via environment-only (no defaults, no schema)
❌ "Temporary" code paths that ship
