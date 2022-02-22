# usage `source bin/dev-completions.sh`

complete -W "$(bash -ec ". bin/dev; typeset -f | grep -Po '(\w*?)(?= \(\))' | tr '\n' ' '")" dev
