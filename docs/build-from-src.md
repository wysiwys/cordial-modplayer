In the root dir, run:
```
cargo build --release --manifest-path backend/Cargo.toml
```

```
npm --prefix frontend ci
npm --prefix frontend run build
```

Combine:
```
mkdir out
cp backend/target/release/cordial_modplayer out/
cp -r frontend/dist out/
```

To run:
```
cd out 
./cordial_modplayer
```


