# Bypass Upload Limit

A [Valenced](https://github.com/Valenced) plugin that makes Discord treat your own account as a Nitro subscriber, only on your device.

The Nitro-subscriber part is ported from Badges Spoof in [valenced-plugins](https://github.com/dxckie-cell/valenced-plugins): it patches `UserStore` and `UserProfileStore` so your own user and profile carry `premium_type` and `premium_since`. Other users are not touched.

## Settings

- **Treat me as a Nitro subscriber**: turns the patch on or off.
- **Subscriber for (months)**: how long ago the subscription is said to have started.
- **Raise the upload size limit**: also lifts the file size check Discord makes on your device.
- **Upload limit (MB)**: the size to allow, 1024 by default (1 GB).

Discord's servers enforce the real upload limit, so a file bigger than your account is allowed there can still be refused after it is picked. Discord's real function names are not known, so every exported function that looks like a file size or upload limit is patched. Reload after changing the plugin.

Reload Valenced after enabling or disabling the plugin.

## Development

```sh
bun install
bun run package
bun run serve
```

```sh
bun run lint:types
bunx biome check plugins scripts
```

## Licence

GPL-3.0, see `LICENSE`.
