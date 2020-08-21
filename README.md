
# JSON API Tools
A monorepo to house various tools to interact with json:api. This package contains 4 main components
* HTTP Client
* API Parser
* API Types
* API Client


### Getting Started


#### Prerequisites
```
node >= 12.13.0
npm i -g link-parent-bin
npm i -g lerna
npm i -g typescript
```

#### Depending on your setup, you may need to install `jest` as your test runner
```
npm i -g jest
```

##### install - will link all local dependencies and hoist all install dependencies
```
npm install
```

##### build all subsequent packages
```
npm run build 
```
##### test all subsequent packages
```
npm run test 
```
##### cleaning stale dependencies

```
npm run clean 
```

##### cleaning  stale builds
```
npm run cleanBuilds
```