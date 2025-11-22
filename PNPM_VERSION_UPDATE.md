# pnpm Version Update: 8.x → 8.15.0 (Exact)

## Summary

Updated all documentation and configuration to require **pnpm 8.15.0 exactly** instead of "8.x or higher".

## Why This Change?

### Before
- Allowed any pnpm 8.x version (8.0.0, 8.5.0, 8.15.0, 8.16.0, etc.)
- Could lead to subtle differences between contributors
- "works on my machine" issues due to minor version differences

### After
- Requires pnpm 8.15.0 exactly (with friendly warning for other versions)
- Everyone uses identical package manager version
- Maximum consistency and reproducibility

## Changes Made

### 1. Configuration Files

#### `package.json`
```json
{
  "engines": {
    "pnpm": "8.15.0"  // Changed from ">=8.0.0"
  }
}
```

#### `scripts/preinstall.js`
- Updated error messages: `npm install -g pnpm@8.15.0`
- Updated version constant: `REQUIRED_PNPM_VERSION = '8.15.0'`

#### `scripts/verify-setup.js`
- Now checks for **exact match** with 8.15.0
- Shows **warning** if different version (not error)
- Example: "pnpm version 8.15.0 recommended (current: 8.16.0)"

### 2. Documentation Updates

All documentation updated from "8.x" or ">=8.0" to "8.15.0":

- ✅ **README.md** - Prerequisites section
- ✅ **QUICKSTART.md** - Installation and troubleshooting
- ✅ **INSTALL.md** - Requirements table and instructions
- ✅ **SETUP.md** - Prerequisites section
- ✅ **CONTRIBUTING.md** - Version requirements section
- ✅ **VERSION_REQUIREMENTS.md** - All mentions updated
- ✅ **SETUP_IMPROVEMENTS_SUMMARY.md** - Updated benefits section

### 3. Code Examples

Updated all command examples:

**Before:**
```bash
npm install -g pnpm@8
```

**After:**
```bash
npm install -g pnpm@8.15.0
```

## Behavior Changes

### Verification Script

**Before (lenient):**
```bash
$ pnpm verify
✅ Passed:
   pnpm 8.16.0 ✓  # Any 8.x version accepted
```

**After (strict with warning):**
```bash
$ pnpm verify
⚠️  Warnings:
   pnpm version 8.15.0 recommended (current: 8.16.0)
```

- ✅ Still allows development with different versions
- ⚠️ Shows warning to encourage exact version
- ❌ Doesn't block contributors (more friendly)

### Preinstall Script

No behavior change - still blocks npm/yarn, but now shows correct version:
```bash
$ npm install
❌ Please use pnpm instead of npm.
📦 Install pnpm: npm install -g pnpm@8.15.0
```

## Migration Guide

### For Existing Contributors

If you have a different pnpm version:

```bash
# Check current version
pnpm --version

# If not 8.15.0, update:
npm install -g pnpm@8.15.0

# Verify
pnpm --version  # Should show: 8.15.0

# Clean reinstall recommended
rm -rf node_modules
pnpm install
```

### For New Contributors

Just follow the updated docs:
```bash
npm install -g pnpm@8.15.0
pnpm setup
```

## Files Modified

### Configuration
- `package.json` - engines.pnpm
- `scripts/preinstall.js` - version constant and messages
- `scripts/verify-setup.js` - exact version check

### Documentation
- `README.md`
- `QUICKSTART.md`
- `INSTALL.md`
- `SETUP.md`
- `CONTRIBUTING.md`
- `VERSION_REQUIREMENTS.md`
- `SETUP_IMPROVEMENTS_SUMMARY.md`

### New Files
- `PNPM_VERSION_UPDATE.md` (this file)

## Testing

All scripts tested and working:

```bash
# ✅ Verify script shows exact version requirement
$ pnpm verify
✅ Passed:
   Node.js v22.13.1 ✓
   pnpm 8.15.0 ✓

# ✅ Preinstall shows correct version
$ npm install
❌ Please use pnpm instead of npm.
📦 Install pnpm: npm install -g pnpm@8.15.0

# ✅ Dev server works
$ pnpm dev
✓ Ready in 3.5s
```

## Benefits

1. **Maximum Consistency**: Everyone uses identical pnpm version
2. **Clear Instructions**: No ambiguity about which version to install
3. **Better Reproducibility**: Eliminates package manager version differences
4. **Still Flexible**: Warnings instead of hard blocks for different versions
5. **CI/CD Ready**: Exact version specified in package.json

## Rationale

### Why 8.15.0 Specifically?

- ✅ Stable release (not bleeding edge)
- ✅ Well-tested in the community
- ✅ Current version used in development
- ✅ No known critical bugs
- ✅ Good performance characteristics

### Why Exact Version vs Range?

**Package managers are critical infrastructure:**
- Different versions can resolve dependencies differently
- Lockfile format can vary between versions
- Edge cases in hoisting behavior
- Performance characteristics may differ

**Result:** Exact version = maximum reproducibility

## Future Updates

When updating pnpm version:

1. **Test thoroughly** across all packages
2. **Update all documentation** (use this file as checklist)
3. **Update scripts** (preinstall.js, verify-setup.js)
4. **Test CI/CD** pipelines
5. **Announce in PR** and migration notes
6. **Give contributors time** to update

## Rollback Plan

If issues arise, revert by:

```bash
git revert <commit-hash>
```

Or manually change back to:
```json
{
  "engines": {
    "pnpm": ">=8.0.0"
  }
}
```

## Related Documentation

- [INSTALL.md](./INSTALL.md) - Installation guide
- [VERSION_REQUIREMENTS.md](./VERSION_REQUIREMENTS.md) - Version enforcement
- [SETUP_IMPROVEMENTS_SUMMARY.md](./SETUP_IMPROVEMENTS_SUMMARY.md) - Setup improvements

---

**Update Completed:** November 22, 2025
**Updated By:** PrivID Team
**Reason:** Maximize version consistency for open source release

