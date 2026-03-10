# Migration from PHPCPD to PDepend

## Summary

The abandoned package `sebastian/phpcpd` has been replaced with `pdepend/pdepend`, an actively maintained alternative that provides code duplication detection along with comprehensive static analysis capabilities.

## Changes Made

### Package Replacement
- **Removed**: `sebastian/phpcpd` (^6.0) - Abandoned package
- **Added**: `pdepend/pdepend` (^2.15) - Active maintenance, more features

### Composer Script Update
- **Old**: `composer phpcpd` → Simple duplication detection
- **New**: `composer duplication` → Comprehensive analysis with XML reports

## Usage

### Basic Usage
```bash
composer duplication
```

This generates:
- `build/logs/pdepend-summary.xml` - Summary with code metrics
- `build/logs/jdepend.xml` - Package dependency information

### What PDepend Provides

PDepend is more comprehensive than PHPCPD:

1. **Code Duplication Detection** ✅ (what PHPCPD did)
2. **Code Metrics**:
   - Cyclomatic Complexity
   - Coupling metrics
   - Class cohesion
   - Maintainability Index
   - Halstead metrics
3. **Dependency Analysis**:
   - Package dependencies
   - Class dependencies
   - Architecture visualization

## Migration Benefits

1. ✅ **Active Maintenance** - Package is actively maintained
2. ✅ **More Features** - Beyond just duplication detection
3. ✅ **Better Reports** - XML output for integration with CI/CD
4. ✅ **No Breaking Changes** - Can still detect duplication

## Notes

- PDepend generates XML reports instead of console output
- Reports are saved to `build/logs/` directory
- The tool analyzes the same codebase structure
- Integration with CI/CD is straightforward via XML reports

---

**Status**: ✅ Migration Complete
**Date**: 2025-11-01

