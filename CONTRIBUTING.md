# Contributing to PrivID

Thank you for your interest in contributing to PrivID! This document provides guidelines and instructions for contributors.

## Code of Conduct

Be respectful, inclusive, and constructive. We're building privacy infrastructure that impacts real users.

## Getting Started

### Prerequisites

- Node.js 20.x LTS
- pnpm 8.x
- Git
- Basic understanding of Ethereum, ZK proofs, and TypeScript

### Setup

```bash
git clone https://github.com/yourusername/privid.git
cd privid
pnpm install
pnpm build
```

See [SETUP.md](./SETUP.md) for detailed instructions.

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-123
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Changes

**Before coding:**
- Check existing issues/PRs to avoid duplicates
- For large changes, open an issue to discuss first

**While coding:**
- Follow existing code style (we use Prettier + ESLint)
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm -F @privid/contracts test
pnpm -F @privid/sdk test
pnpm -F web test:e2e

# Check linting
pnpm lint
```

### 4. Commit

We use conventional commits:

```bash
git commit -m "feat: add age range proof circuit"
git commit -m "fix: prevent nonce replay in ProofConsumer"
git commit -m "docs: update SETUP guide with Noir installation"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting (no code change)
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance (deps, config)

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub with:
- Clear title and description
- Link to related issue(s)
- Screenshots (for UI changes)
- Test results
- Any breaking changes noted

## Project Structure

```
privid/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── contracts/        # Solidity contracts
│   ├── sdk/              # TypeScript SDK
│   └── circuits/         # Noir ZK circuits
├── docs/                 # Documentation & ADRs
└── [config files]
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Handle errors explicitly (no silent failures)

**Example:**
```typescript
/**
 * Generate a commitment hash for a credential
 * @param issuerDid - DID of the credential issuer
 * @param schemaId - Schema identifier
 * @param fields - Credential fields
 * @param salt - Random salt for uniqueness
 * @returns Hex-encoded commitment hash
 */
export function generateCommitment(
  issuerDid: string,
  schemaId: string,
  fields: Record<string, unknown>,
  salt: string
): string {
  // Implementation
}
```

### Solidity

- Use Solidity ^0.8.24
- Follow OpenZeppelin patterns
- Use custom errors (not `require` strings)
- Add NatSpec comments
- Optimize for gas (but prioritize clarity)

**Example:**
```solidity
/**
 * @notice Add a credential commitment to the vault
 * @param commitment The Poseidon hash of the credential
 * @param expiry Unix timestamp when the credential expires
 * @custom:emits CommitmentAdded
 */
function addCommitment(bytes32 commitment, uint256 expiry) external {
    if (commitment == bytes32(0)) revert ZeroCommitment();
    if (expiry <= block.timestamp) revert InvalidExpiry();
    // ...
}
```

### React/Next.js

- Use functional components + hooks
- Extract logic into custom hooks
- Use TypeScript for props
- Handle loading/error states
- Follow accessibility best practices

**Example:**
```tsx
interface CredentialCardProps {
  credential: VaultRecord;
  onSelect?: (id: string) => void;
}

export function CredentialCard({ credential, onSelect }: CredentialCardProps) {
  const isExpired = credential.expiry < Date.now() / 1000;
  
  return (
    <div
      className={/* styles */}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(credential.id)}
      onKeyPress={(e) => e.key === 'Enter' && onSelect?.(credential.id)}
    >
      {/* content */}
    </div>
  );
}
```

## Testing Guidelines

### Unit Tests

- Test pure functions and utilities
- Mock external dependencies
- Use descriptive test names
- Cover edge cases

**Example:**
```typescript
describe('generateCommitment', () => {
  it('should generate deterministic hash for same inputs', () => {
    const hash1 = generateCommitment('did:test', 'kyc_v1', { age: 25 }, 'salt123');
    const hash2 = generateCommitment('did:test', 'kyc_v1', { age: 25 }, 'salt123');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different salt', () => {
    const hash1 = generateCommitment('did:test', 'kyc_v1', { age: 25 }, 'salt1');
    const hash2 = generateCommitment('did:test', 'kyc_v1', { age: 25 }, 'salt2');
    expect(hash1).not.toBe(hash2);
  });
});
```

### Contract Tests

- Test happy path + failure cases
- Verify events are emitted
- Check state changes
- Test access control

### E2E Tests

- Test critical user flows
- Use realistic data
- Check UI feedback
- Test across browsers (Playwright)

## Documentation

**When to update docs:**
- Adding/changing public APIs
- Modifying contract interfaces
- Changing configuration
- Adding new features
- Fixing bugs that affect usage

**Where to document:**
- Code comments (inline)
- README.md (high-level overview)
- SETUP.md (installation & config)
- ARCHITECTURE.md (technical design)
- ADRs in `docs/` (major decisions)

## Security

**If you find a security vulnerability:**
1. **Do NOT open a public issue**
2. Email us at security@privid.app
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

**Security checklist for PRs:**
- [ ] No PII in logs or error messages
- [ ] Sensitive data encrypted
- [ ] Input validation for all user inputs
- [ ] Access control checked
- [ ] Reentrancy guards on state-changing functions
- [ ] No hardcoded secrets

## Performance

**Optimization priorities:**
1. Correctness
2. Clarity
3. Performance

Don't prematurely optimize. Profile first, then optimize hot paths.

**For contracts:**
- Batch operations where possible
- Use `calldata` for read-only params
- Cache storage reads
- Use events over storage when possible

**For frontend:**
- Lazy load heavy components
- Debounce user inputs
- Use React Query for caching
- Optimize images

## Pull Request Checklist

Before submitting:

- [ ] Code builds without errors
- [ ] All tests pass
- [ ] Lint checks pass
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with main
- [ ] No merge conflicts
- [ ] PR description is clear

## Review Process

1. **Automated checks** (CI) must pass
2. **Code review** by at least one maintainer
3. **Testing** on testnet (for contract changes)
4. **Approval** from maintainer
5. **Merge** (squash and merge for features, rebase for fixes)

## Release Process

We use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

Releases are tagged and documented in CHANGELOG.md.

## Questions?

- Open a [GitHub Discussion](https://github.com/yourusername/privid/discussions)
- Join our [Discord](https://discord.gg/privid) (coming soon)
- Email: dev@privid.app

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to PrivID!**

