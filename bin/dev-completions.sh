# usage `source bin/dev-completions.sh`

_dev_completions () {
	dev_function_names="$(bash -ec "source $(which dev); typeset -f | grep -Po '(\w*?)(?= \(\))' | tr '\n' ' '")"
	COMPREPLY=($(compgen -W "$dev_function_names" "${COMP_WORDS[1]}"))
}

complete -F _dev_completions dev
