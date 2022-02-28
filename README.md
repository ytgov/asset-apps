# ASSET MANAGEMENT APPLICATIONS

This repository contains the source for all projects related to internal Asset Management.

## Contributors:

-   Sean Pond
-   Michael Johnson

## Projects

### Asset Tracking : `/src/tracker`

---

### Development

```
cd src/tracker
mv .env.example .env
# fill .env in relevant secrets

npm install
npm run start
```

### Test/Production

This application runs in a Docker container

```
docker-compose up -d
```

---

### Other App : `/src/otherapp`

### Development

```
npm run start
```

Normalizing code before shipping can be accomplished via:

`npm run lint` vai both the "web" or "api" package scripts.

### Production

```

```

---
