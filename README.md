# Bypass Upload Limit

A [Valenced](https://github.com/Valenced) plugin that makes Discord treat your own account as a Nitro subscriber, only on your device.

The Nitro-subscriber part is ported from Badges Spoof in [valenced-plugins](https://github.com/dxckie-cell/valenced-plugins): it patches `UserStore` and `UserProfileStore` so your own user and profile carry `premium_type` and `premium_since`. Other users are not touched.

## Settings

- **Treat me as a Nitro subscriber**: turns the patch on or off.
- **Subscriber for (months)**: how long ago the subscription is said to have started.

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
