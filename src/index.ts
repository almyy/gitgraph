import Git, { Commit } from "nodegit";

var count = 0;

const onCommit = thing => async (commit: Commit) => {
  if (++count > 10) return;
  const diff = await commit.getDiff();
  diff.forEach(async diff => {
    const patches = await diff.patches();
    patches.forEach(patch => {
      const splitted = patch
        .newFile()
        .path()
        .split(".");
      const ext = splitted[splitted.length - 1];
      if (patch.isAdded()) {
        console.log(`Added ${patch.size()} lines with ext ${ext}`);
        if (ext === "java") {
          thing.java += patch.size();
        } else if (ext === "kt") {
          thing.kotlin += patch.size();
        }
      }
      if (patch.isDeleted()) {
        console.log(`Removed ${patch.size()} lines with ext ${ext}`);
        if (ext === "java") {
          thing.java -= patch.size();
        } else if (ext === "kt") {
          thing.kotlin -= patch.size();
        }
      }
    });
  });
};

const doTheNeedful = async () => {
  const repo = await Git.Repository.open("C:/Users/Martin/gits/scale");
  const firstCommit = await repo.getMasterCommit();
  const history = firstCommit.history();

  const thing = { java: 0, kotlin: 0 };

  history.on("commit", onCommit(thing));
  await history.start();
  return thing;
};

doTheNeedful().then(thing => {
  console.log("garb", thing.java);
});
