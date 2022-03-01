# ASSET MANAGEMENT APPLICATIONS

This repository contains the source for all projects related to internal Asset Management.

## Contributors:

-   Sean Pond
-   Michael Johnson
-   Marlen Brunner

### Development

```
docker-compose -f docker-compose.dev.yaml up

# or if you can run bash
bin/dev up
```

Old Way

```
# at top level folder
docker-compose -f docker-compose.dev.yaml up

cd api
mv .env.example .env.development
# fill .env in relevant secrets
npm install
npm run start

cd ../web
npm install
npm run start
```

### Production

This application runs in a Docker container

```
docker-compose up -d
```
