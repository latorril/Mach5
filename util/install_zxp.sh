#! /bin/bash -ex
XMAN_CMD="/Applications/Adobe Extension Manager CC/Adobe Extension Manager CC.app/Contents/MacOS/Adobe Extension Manager CC"
"$XMAN_CMD" -suppress -install zxp=../bin/ExpelliartusMaximus.zxp
echo $?
