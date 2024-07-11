# Contributing to HABPanel

Want to hack on HABPanel? Awesome!
Here are instructions to get you started. They are similar to those of openHAB itself.

## Reporting Issues

Please report [HABPanel specific issues here](https://github.com/openhab/habpanel/issues),
while issues that are related to openHAB2 or Eclipse SmartHome should be reported in the
[openHAB2 GitHub repository](https://github.com/openhab/openhab2/issues) or the
[bugzilla of Eclipse SmartHome](https://bugs.eclipse.org/bugs/buglist.cgi?product=SmartHome&component=Core), respectively.
Do not worry, if you are not clear, which category your issue belongs to - we will
redirect you, if necessary.

## Build Environment

You need NodeJS 16.14 or later and npm 8.6 or later installed.

It is assumed you have `npm`, `bower` and `gulp` available;
if not, check their respective docs.

To build the Javascript part of HABPanel, navigate to the ```web/``` subfolder, then:
1. Run ```npm install```
2. Run ```bower install```
3. Run ```gulp```

Files in the ```vendor/``` directory should be rebuilt with the above operations.
(note: if adding a new dependency, never add it directly to the project,
add it as a bower and/or npm dependency and rebuild the project using the
instructions above! You would have to modify the targets in ```gulpfile.js``` as well)

You also need to set up an openHAB development environment.
For instructions on doing so, please refer to the [IDE setup guide](https://github.com/openhab/openhab/wiki/IDE-Setup).

Once it's done:
- Package a new version of the bundle using Maven (```mvn clean package``` or use m2e)
- Copy the resulting ```target/org.openhab.ui.habpanel.{VERSION}.jar``` into your
  server's ```addons``` subfolder to test it.

If everything went well, push your branch to GitHub, create a pull request and request
a merge approval - see instructions below.


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

We recommend discussing your plans [in the discussion forum](https://community.openhab.org/c/apps-services/habpanel)
before starting to code - especially for more ambitious contributions.
This gives other contributors a chance to point you in the right
direction, give feedback on your design, and maybe point out if someone
else is working on the same thing.

### Create issues...

Any significant improvement should be documented as [a GitHub
issue](https://github.com/openhab/habpanel/issues?labels=enhancement&page=1&state=open) before anybody
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

Commit messages must start with a capitalized and short summary (max. 50
chars) written in the imperative, followed by an optional, more detailed
explanatory text which is separated from the summary by an empty line.

Code review comments may be added to your pull request. Discuss, then make the
suggested modifications and push additional commits to your feature branch. Be
sure to post a comment after pushing. The new commits will show up in the pull
request automatically, but the reviewers will not be notified unless you
comment.

Before the pull request is merged, make sure that you squash your commits into
logical units of work using `git rebase -i` and `git push -f`. After every
commit the test suite should be passing. Include documentation changes in the
same commit so that a revert would remove all traces of the feature or fix.

Commits that fix or close an issue should include a reference like `Closes #XXX`
or `Fixes #XXX`, which will automatically close the issue when merged.

Add your name to the AUTHORS file, but make sure the list is sorted and your
name and email address match your git configuration. The AUTHORS file is
regenerated occasionally from the git commit history, so a mismatch may result
in your changes being overwritten.

### Merge approval

openHAB maintainers use LGTM (Looks Good To Me) in comments on the code review
to indicate acceptance.

A change requires LGTMs from an absolute majority of the maintainers of each
component affected. For example, if a change affects `docs/` and `addons/`, it
needs an absolute majority from the maintainers of `docs/` AND, separately, an
absolute majority of the maintainers of `addons/`.

### Sign your work

The sign-off is a simple line at the end of the explanation for the
patch, which certifies that you wrote it or otherwise have the right to
pass it on as an open-source patch.  The rules are pretty simple: if you
can certify the below (from
[developercertificate.org](https://developercertificate.org/)):

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
* Step 3: volunteer on [the discussion group](https://community.openhab.org/c/apps-services/habpanel) or on [GitHub](https://github.com/openhab/habpanel/issues?labels=question&page=1&state=open)

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

## Acknowledgements

HABPanel was made possible (apart from ESH and openHAB themselves, of course)
thanks to these awesome JavaScript libraries, most notably:

- [AngularJS](https://github.com/angular/angular.js)
- [angular-atmosphere](https://github.com/spyboost/angular-atmosphere)
- [angular-clipboard](https://github.com/omichelsen/angular-clipboard)
- [angular-clock](https://github.com/deepu105/angular-clock)
- [angular-fullscreen](https://github.com/fabiobiondi/angular-fullscreen)
- [angular-gridster](https://github.com/ManifestWebDesign/angular-gridster)
- [angular-sanitize](https://github.com/angular/bower-angular-sanitize)
- [angular-local-storage](https://github.com/grevory/angular-local-storage)
- [angular-prompt](https://github.com/cgross/angular-prompt)
- [angular-slider](https://github.com/angular-slider/angularjs-slider)
- [angular-ui-bootstrap](https://github.com/angular-ui/bootstrap)
- [angular-ui-select](https://github.com/angular-ui/ui-select)
- [angular-ui-codemirror](https://github.com/angular-ui/ui-codemirror)
- [angular-web-colorpicker](https://github.com/twler/angular-web-colorpicker)
- [atmosphere.js](https://github.com/Atmosphere/atmosphere-javascript)
- [CodeMirror](https://github.com/codemirror/codemirror)
- [D3](https://github.com/d3/d3)
- [iNoBounce](https://github.com/lazd/iNoBounce)
- [n3-line-chart](https://github.com/n3-charts/line-chart)
- [ng-knob](https://github.com/RadMie/ng-knob)
- [sprintf.js](https://github.com/alexei/sprintf.js)
- [event-source-polyfill](https://github.com/Yaffle/EventSource/)
- [FileSaver](https://github.com/eligrey/FileSaver.js)
- [angular-file-saver](https://github.com/alferov/angular-file-saver)
- [snap.js](https://github.com/jakiestfu/Snap.js)
- [angular-snap](https://github.com/jtrussell/angular-snap.js)

Check out the ```web/bower.json``` and ```web/package.json``` files for the complete list.

[<img align="right" src="https://user-images.githubusercontent.com/2004147/30233170-35d19c3a-94f4-11e7-8540-894977d1c653.png">](https://www.browserstack.com/) Thanks to [BrowserStack](https://www.browserstack.com/) for kindly providing the maintainer with a free open source account to help testing HABPanel on a wide range of devices!
