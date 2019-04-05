# Contributing to HABmin

Want to hack on HABmin? Awesome! Here are instructions to get you
started. They are probably not perfect, please let us know if anything
feels wrong or incomplete.

## Reporting Issues

Please report [HABmin specific issues here](https://github.com/openhab/org.openhab.ui.habmin/issues). Any issues relating to Z-Wave and the Z-Wave
device database should be reported in the [Z-Wave binding issue tracker](https://github.com/openhab/org.openhab.binding.zwave/issues).

## Build Environment

For instructions on setting up your development environment, please
see our dedicated [IDE setup guide](https://github.com/openhab/openhab/wiki/IDE-Setup).

### Javascript Build Environment

When compiling using maven, the build process will build the Java and Javascript elements of the project, however during development it is easier and quicker to build the Javascript elements of the project separately.

Install ```npm``` (node package manager) and run ```npm install``` to install all the development dependencies.
Note that  I am currently keeping the dependancies in the repository. This is because in some cases I've modified them
so I think it's easier/safer to store everything used to generate the code.

For mobile app compilation, you need to install ```cordova``` and ```ant``` and the android developers kits and set paths appropriately. (I might include this in the maven build at some point).

To compile for debug, run ```grunt build```. This will generate a debug build in the ```build`` folder
and also put a zipped ```debug``` version into the ```output``` folder.

To compile for mobile releases (currently only Android supported), run ```grunt mobile```

To compile for release, run ```grunt compile```. This will generate a minified version in the ```bin``` folder
and also put a zipped ```debug``` and ```release``` versions into the ```output``` folder.


## Contribution guidelines

### Pull requests are always welcome

We are always thrilled to receive pull requests, and do our best to
process them as fast as possible. Not sure if that typo is worth a pull
request? Do it! We will appreciate it.

If your pull request is not accepted on the first try, don't be
discouraged! If there's a problem with the implementation, hopefully you
received feedback on what to improve.

We're trying very hard to keep openHAB lean and focused. We don't want it
to do everything for everybody. This means that we might decide against
incorporating a new feature. However, there might be a way to implement
that feature *on top of* openHAB.

### Discuss your design on the mailing list

We recommend discussing your plans [in the discussion forum](https://community.openhab.org/c/openhab-2)
before starting to code - especially for more ambitious contributions.
This gives other contributors a chance to point you in the right
direction, give feedback on your design, and maybe point out if someone
else is working on the same thing.

### Create issues...

Any significant improvement should be documented as [a GitHub
issue](https://github.com/openhab/openhab2/issues?labels=enhancement&page=1&state=open) before anybody
starts working on it.

### ...but check for existing issues first!

Please take a moment to check that an issue doesn't already exist
documenting your bug report or improvement proposal. If it does, it
never hurts to add a quick "+1" or "I have this problem too". This will
help prioritize the most common problems and requests.

### Conventions

Fork the repo and make changes on your fork in a feature branch:

- If it's a bugfix branch, name it XXX-something where XXX is the number of the
  issue
- If it's a feature branch, create an enhancement issue to announce your
  intentions, and name it XXX-something where XXX is the number of the issue.

Submit unit tests for your changes.  openHAB has a great test framework built in; use
it! Take a look at existing tests for inspiration. Run the full test suite on
your branch before submitting a pull request.

Update the documentation when creating or modifying features. Test
your documentation changes for clarity, concision, and correctness, as
well as a clean documentation build.

Write clean code. Universally formatted code promotes ease of writing, reading,
and maintenance.

Pull requests descriptions should be as clear as possible and include a
reference to all the issues that they address.

Pull requests must not contain commits from other users or branches.

Commit messages use the conventional changelog format as described below.
Please respect this format as it will help us maintain the changelog.

Code review comments may be added to your pull request. Discuss, then make the
suggested modifications and push additional commits to your feature branch. Be
sure to post a comment after pushing. The new commits will show up in the pull
request automatically, but the reviewers will not be notified unless you
comment.

Commits that fix or close an issue should include a reference like `Closes #XXX`
or `Fixes #XXX`, which will automatically close the issue when merged.

Add your name to the AUTHORS file, but make sure the list is sorted and your
name and email address match your git configuration. The AUTHORS file is
regenerated occasionally from the git commit history, so a mismatch may result
in your changes being overwritten.

### Commit Messages
This project is using the conventional changelog, and this requires that commit messages be in a certain format for them to be used to generate the change log. So, for messages to appear in the changelog, please use the convention here [conventional-changelog/CONVENTIONS.md](https://github.com/ajoslin/conventional-changelog/blob/master/CONVENTIONS.md) for a synposis of the conventions with commit examples.

The project is using the following ```scope``` options -:
* Dashboard: For dashboard specific changes
* Designer: For changes in the graphical rule editor
* Chart: For the interactive charting
* Items: For item management and configuration
* Mobile: When related specifically to mobile app generation
* Persistence: For anything relating to the maintenance of persistence data
* Rules: For anything to do with rules and rule editing
* Sitemap: For sitemap changes
* Things: For OpenHAB2 thing management
* UI: for the majority of general changes
* ZWave: For zwave specific changes

eg:
* feat(UI): Add theme switching
* feat(Mobile): Persist server address to local storage
* fix(ZWave): Fix network diagram resizing

Anything not using the standard format will not be placed in the changelog.

### Language Translations

HABmin supports multi-languages through i18n files containing translation strings. These files are placed in the ```/src/languages``` folder, and the system uses a hierarchical approach when displaying strings.
So we might have ```de-CH``` for Swiss German, and strings defined for this locale will use Swiss localisation
as first priority. If no string is available, then it should fall back to the default German localisation, and if no string is found here, it will fall back to the default localisation - English.

There is an online translation form at [cd-jackson.com](http://www.cd-jackson.com). This will allow you to provide translations for each string using a simple form and is the recommended way to provide the translations. You should register on the site and then request edit access. Using the online form should reduce misformatting and errors.

### Sign your work

The sign-off is a simple line at the end of the explanation for the
patch, which certifies that you wrote it or otherwise have the right to
pass it on as an open-source patch.  The rules are pretty simple: if you
can certify the below (from
[developercertificate.org](http://developercertificate.org/)):

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
660 York Street, Suite 102,
San Francisco, CA 94110 USA

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

then you just add a line to every git commit message:

    Signed-off-by: Joe Smith <joe.smith@email.com> (github: github_handle)

using your real name (sorry, no pseudonyms or anonymous contributions.)

One way to automate this, is customise your get ``commit.template`` by adding
a ``prepare-commit-msg`` hook to your openHAB checkout:

```
curl -L -o .git/hooks/prepare-commit-msg https://raw.github.com/openhab/openhab2/master/contrib/prepare-commit-msg.hook && chmod +x .git/hooks/prepare-commit-msg
```

* Note: the above script expects to find your GitHub user name in ``git config --get github.user``

#### Small patch exception

There are several exceptions to the signing requirement. Currently these are:

* Your patch fixes spelling or grammar errors.
* Your patch is a single line change to documentation.

### How can I become a maintainer?

* Step 1: learn the component inside out
* Step 2: make yourself useful by contributing code, bugfixes, support etc.
* Step 3: volunteer on [the discussion group] (https://github.com/openhab/openhab2/issues?labels=question&page=1&state=open)

Don't forget: being a maintainer is a time investment. Make sure you will have time to make yourself available.
You don't have to be a maintainer to make a difference on the project!

## Community Guidelines

We want to keep the openHAB community awesome, growing and collaborative. We
need your help to keep it that way. To help with this we've come up with some
general guidelines for the community as a whole:

* Be nice: Be courteous, respectful and polite to fellow community members: no
  regional, racial, gender, or other abuse will be tolerated. We like nice people
  way better than mean ones!

* Encourage diversity and participation: Make everyone in our community
  feel welcome, regardless of their background and the extent of their
  contributions, and do everything possible to encourage participation in
  our community.

* Keep it legal: Basically, don't get us in trouble. Share only content that
  you own, do not share private or sensitive information, and don't break the
  law.

* Stay on topic: Make sure that you are posting to the correct channel
  and avoid off-topic discussions. Remember when you update an issue or
  respond to an email you are potentially sending to a large number of
  people.  Please consider this before you update.  Also remember that
  nobody likes spam.
