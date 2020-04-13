# actions-limit-rate

prevents duplicated build for save billing!

## Inputs

### `who-to-greet`

**Required** rate for limit default: `"10mins"`.

### `token`

**Required** Github token for build actions.

## Example usage

uses: actions/hello-world-javascript-action@v1
with:
rate: 15mins
token: \${{actions:GITHUB_TOKEN}}
