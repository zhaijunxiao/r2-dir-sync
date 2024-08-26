# r2-dir-upload
Github action to upload static directory of files to Cloudflare R2

Before uploading, it will first check whether it is consistent with the local file. If there is no corresponding file in R2, or the file is inconsistent, it will be updated.

## Inputs

### `accountid`

**Required** The R2 Account ID.

### `accesskeyid`

**Required** The R2 Access Key ID.

### `secretaccesskey`

**Required** The R2 Secret Key.

### `bucket`
**Required** The R2 bucket name.

### `source`

**Required** The directory you want to upload.

### `destination`

**Optional** Destination path of the directory. Defaults to the root of the bucket.

### `filenamePattern`

**Optional** Filter sent files using regular expressions


## Example usage
```yaml
- name: R2 Directory Sync
  uses: zhaijunxiao/r2-dir-sync@v0.0.2
  with:
    accountid: ${{ secrets.CF_ACCOUNT_ID }}
    accesskeyid: ${{ secrets.CF_ACCESS_KEY }}
    secretaccesskey: ${{ secrets.CF_SECRET_KEY }}
    bucket: ${{ secrets.R2_BUCKET }}
    source: ${{ github.workspace }}/static
    destination: dir
    filenamePattern: .*
```