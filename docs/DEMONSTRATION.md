# Public demonstration

Mesa Migrate was run read-only against the public
[`o1-labs-XT/mastermind-zkApp`](https://github.com/o1-labs-XT/mastermind-zkApp)
repository, branch `level1`, at commit
[`bdfc7c917f906467fd0b712661955df825d97339`](https://github.com/o1-labs-XT/mastermind-zkApp/tree/bdfc7c917f906467fd0b712661955df825d97339).

```sh
node ./src/cli.js scan /path/to/mastermind-zkApp --format json
```

The scan produced one warning, `MESA003`, for an `o1js: "1.*"` dependency in
that revision's `package.json`.

This is not a compatibility verdict for that application. The scanner did not
modify the repository, compile it, inspect its deployment, or determine whether
the project has already completed other migration work. It demonstrates only
that Mesa Migrate can locate an upstream-documented pre-Mesa dependency without
requiring project-specific configuration.
