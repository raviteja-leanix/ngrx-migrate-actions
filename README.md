# Getting Started With ngrx-migrate-actions

This schematic can be used for migrating Ngrx6 actions and reducers to Ngrx11.

In Ngrx 6 actions are defined using classes like below.
```bash
export class LoginAction implements Action {
  readonly type = LOGIN;
  constructor(public userName: string, public password: string) { }
}
```

In Ngrx11, actions are created using `createAction` function.
```bash
export const LoginAction = createAction(
    '[LoginAction]',
    (userName: string, password: string) => ({ userName, password }),
);
```

### Usage

To use this in your project, install `ngrx-migrate-actions` and run one of below command. Reducer migrations still need more work.

```bash
yarn install ngrx-migrate-actions --dev // install using yarn
npm install -d ngrx-migrate-actions // install using npm
schematics .\node_modules\ngrx-migrate-actions\:convertReducers --filePath <folder which contains reducer files>
```

### For local development

```
npm run-script build
schematics .:convertReducers --filePath <file path> --dry-run=false
```