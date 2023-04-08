# Local Cache javascript action

This action caches artifacts to improve workflow execution time on self hosted machine.
Artifacts are cached in the /tmp/.cache.

## Inputs

### `base`

**Optional** A top directory to cache and restore.

### `path`

**Required** A directory to cache and restore.

### `key`

**Required** An explicit key for a cache entry.

## Outputs

### `cache-hit`

Cache hit or not

## Example usage

```yaml
uses: corca-ai/local-cache@1
with:
  path: node_modules
  key: ${{ hashFiles('yarn.lock') }}
```
