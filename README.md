# Local Cache javascript action

This action caches artifacts to improve workflow execution time on self hosted machine.
Artifacts are cached in the /tmp/.cache.

## Inputs

### `path`

**Required** Where to cache

### `key`

**Required** How to check cache hit

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
