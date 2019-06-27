workflow "Publish Tag" {
  on       = "push"
  resolves = "publish"
}

action "install" {
  uses = "actions/npm@master"

  args = [
    "install --unsafe-perm"
  ]
}

action "test" {
  uses  = "actions/npm@master"

  needs = [
    "install"
  ]

  args  = [
    "test"
  ]
}

action "tag-filter" {
  uses  = "actions/bin/filter@master"
  args  = "tag"

  needs = [
    "test"
  ]
}

action "publish" {
  uses    = "actions/npm@master"

  needs   = [
    "tag-filter"
  ]

  args    = [
    "publish"
  ]

  secrets = [
    "NPM_AUTH_TOKEN"
  ]
}
