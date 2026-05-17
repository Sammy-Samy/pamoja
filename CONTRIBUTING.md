# Contributing to Pamoja

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository and clone your fork
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following the guidelines below
4. Push and open a Pull Request against `main`

## Development Setup

See [README.md](./README.md#-quick-start) for full setup instructions.

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add group expiry support
fix: correct percentage rounding in distribution
docs: update contract deployment guide
test: add factory contract unit tests
chore: bump stellar-sdk to 12.1.0
```

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Add/update tests for any changed behaviour
- Ensure `cargo test` and `pnpm test` pass before opening a PR
- Reference any related issues: `Closes #42`

## Code Style

**Rust:** `cargo fmt` + `cargo clippy --deny warnings`  
**TypeScript:** ESLint + Prettier (run `pnpm lint` and `pnpm format`)

## Reporting Issues

Use [GitHub Issues](https://github.com/pamoja-app/pamoja/issues). Include:
- Steps to reproduce
- Expected vs actual behaviour
- Environment (OS, Node version, Rust version)

## Security

Do **not** open public issues for security vulnerabilities. Email `security@pamoja.app` instead.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be kind.
