---
name: test-discipline
description: "Write comprehensive tests that actually catch bugs. Covers unit, integration, e2e, contract, property-based, and performance tests. Use when adding new code, fixing a bug, or hardening code that 'works but feels fragile'."
version: 1.0.0
author: Kiro
license: MIT
---

# Test Discipline

A test that always passes is worse than no test — it's a lie that loses trust. This skill enforces tests that catch real failures.

## When to Use

- Writing any new code path
- Fixing a bug (a regression test should land with the fix)
- Hardening a fragile area
- Onboarding to a codebase with low coverage
- Before any refactor

## The Six Test Levels

Pick the minimum level that gives you confidence:

### L1 — Unit tests

Pure functions, in isolation. No I/O. Fast (millisecond per test).

```go
func TestParseRole(t *testing.T) {
    tests := []struct {
        name  string
        input string
        want  string
        err   bool
    }{
        {"valid", "Researcher", "Researcher", false},
        {"trims whitespace", "  Writer  ", "Writer", false},
        {"too short", "A", "", true},
        {"too long", strings.Repeat("x", 101), "", true},
        {"empty", "", "", true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := parseRole(tt.input)
            if (err != nil) != tt.err {
                t.Errorf("err=%v want=%v", err, tt.err)
            }
            if got != tt.want {
                t.Errorf("got=%q want=%q", got, tt.want)
            }
        })
    }
}
```

### L2 — Integration tests

Two or more components together. May use real DB, fake HTTP server, embedded queue.

```go
func TestCrewKickoff_Integration(t *testing.T) {
    if testing.Short() {
        t.Skip("integration")
    }

    llm := testutil.NewMockLLM().WithResponse(`{"trends": ["agents"]}`)
    mem := memory.NewMemoryStore(t.TempDir())
    crew := gocrew.NewCrew(/*...*/)
    crew.SetLLM(llm)
    crew.SetMemory(mem)

    result, err := crew.Kickoff(context.Background())
    require.NoError(t, err)
    require.NotNil(t, result)

    // Verify side effects
    hist, _ := mem.Recall(ctx, "trends", 5)
    require.NotEmpty(t, hist)
}
```

### L3 — Contract tests

The interface doesn't change unexpectedly. Run against any implementer (real or fake).

```go
func TestMemoryStoreContract(t *testing.T) {
    stores := []MemoryStore{
        sqliteStore,
        redisStore,
        // MemoryStore implementations are interchangeable,
        // so all of them must pass this contract.
    }
    for _, s := range stores {
        t.Run(s.Name(), func(t *testing.T) {
            runMemoryContract(t, s)
        })
    }
}
```

### L4 — End-to-end

The full user journey. Slower. Run on every release, not every commit.

```go
func TestUserJourneyResearchCrew(t *testing.T) {
    if testing.Short() {
        t.Skip("e2e")
    }

    server := newTestServer(t) // boots real crew service
    defer server.Shutdown()

    resp := server.MustPost("/api/kickoff", jsonBody)
    sessionID := gjson.Get(resp, "session_id").String()

    // Poll until done
    deadline := time.Now().Add(30 * time.Second)
    for time.Now().Before(deadline) {
        state := server.MustGet("/api/session/" + sessionID)
        if gjson.Get(state, "status").String() == "completed" {
            break
        }
        time.Sleep(100 * time.Millisecond)
    }

    output := server.MustGetOutput(sessionID)
    require.NotEmpty(t, output)
    require.Contains(t, output, "expected trend")
}
```

### L5 — Property-based

Generate random inputs and verify invariants.

```go
func TestProperty_ParseRoleNeverCrashes(t *testing.T) {
    quick.Check(func(s string) bool {
        _, err := parseRole(s)
        return err == nil || err.Error() != "" // err is well-formed
    }, nil)
}
```

### L6 — Performance / load

Does the code hold up under load?

```go
func BenchmarkAgentRun(b *testing.B) {
    llm := testutil.NewMockLLM().WithFixedLatency(50 * time.Millisecond)
    agent := gocrew.NewAgent(/*...*/).WithLLM(llm)

    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            _, err := agent.Run(context.Background(), task)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}
```

## Test-First Heuristic

When writing a new feature, the order matters:

1. **Write a test that demonstrates the bug or requirement.** It should fail.
2. **Run it.** Confirm it's the right kind of failure.
3. **Write the minimum code to make it pass.**
4. **Refactor for clarity.** Tests still pass.
5. **Add edge cases.** Each becomes another failing test first.

If you skip step 2 and the test "passes immediately," your test is asserting the wrong thing.

## Coverage Is Not Quality

- **Coverage target:** meaningful, not arbitrary. 70% with sharp tests beats 95% with mocks.
- **What to assert:** behavior, not implementation.
- **Brittle tests:** tests that break when you rename an internal function. Refactor the test, not the code.

## Test the Error Path

Every function returns errors. Test those errors.

```go
func TestRepo_FindByID_NotFound(t *testing.T) {
    _, err := repo.FindByID(ctx, "nonexistent")
    require.Error(t, err)
    require.True(t, errors.Is(err, ErrNotFound))
}

func TestAgent_Run_Timeout(t *testing.T) {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Millisecond)
    defer cancel()

    _, err := agent.Run(ctx, task)
    require.Error(t, err)
    require.True(t, errors.Is(err, context.DeadlineExceeded))
}
```

## Flake Reduction

Flakey tests are a tax on every developer, forever. Eliminate them:

- **Network dependencies:** wrap in `httptest.Server` or use a fake
- **Time dependencies:** use a clock interface you can fast-forward
- **Goroutine scheduling:** use deterministic barriers (channels, not sleeps)
- **Filesystem:** use `t.TempDir()`, not absolute paths
- **Order dependencies:** each test sets up its own state, no shared globals

## What NOT To Do

❌ `if err != nil { t.Fatal(err) }` as the entire body of a test
❌ Tests that assert on internals (private fields, exact log lines)
❌ Tests that depend on other tests running first
❌ Snapshot tests of complex output without reviewable diffs
❌ Mocking the system under test's own types
❌ Coverage theater: covering throwaway code to hit a number

## Pull Request Checklist

Before requesting review:

- [ ] Tests run locally and pass
- [ ] No new tests are flakey (run them 10x to verify)
- [ ] Regression test for any bug fixed
- [ ] Coverage on new code paths is intentional, not arbitrary
- [ ] Test names describe behavior, not implementation
- [ ] No skipped tests without a comment explaining why
