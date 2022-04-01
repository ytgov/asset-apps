# ASSET MANAGEMENT APPLICATIONS

This repository contains the source for all projects related to internal Asset Management.

## Contributors:

-   Sean Pond
-   Michael Johnson
-   Marlen Brunner

### Development

```
docker-compose -f docker-compose.dev.yaml up

# or if you can run ruby
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

#### Testing emails

1. Install the [nodemailer app](https://nodemailer.com/app/).
2. Boot the app and observer view the connection error for the mailer.
    > You can do this by saving the `api/src/services/email-service.ts` file.
3. Start a local server via the NodemailerApp and listen on the IP your app
   tried to connect to e.g. `172.17.0.1`
    > On my Ubuntu system this is the second field returned by `hostname -I`

### Production

This application runs in a Docker container

```
docker-compose up -d
```
