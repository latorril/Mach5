#! /bin/bash -ex

#XMAN_CMD="/Applications/Adobe Extension Manager CC/Adobe Extension Manager CC.app/Contents/MacOS/Adobe Extension Manager CC"
#"$XMAN_CMD" -suppress -package mxi=../ExpelliartusMaximus.mxi zxp=../bin/ExpelliartusMaximus.zxp
#echo $?

#java -jar ucf.jar -package -storetype PKCS12 -keystore myCert.p12 -storepass mypasswd -tsa https://timestamp.geotrust.com/tsa myExtension.zxp -C ./myExtension .
#java -jar signingtoolkit/ucf.jar -package -storetype PKCS12 -keystore ../cert.p12 -storepass lumosity -tsa https://timestamp.geotrust.com/tsa ../bin/ExpelliartusMaximus.zxp -C .. .
if [ -f ../bin/ExpelliartusMaximus.zxp ]; then
    rm ../bin/ExpelliartusMaximus.zxp
fi
./ZXPSignCmd -sign ../ExpelliartusMaximus ../bin/ExpelliartusMaximus.zxp cert.p12 lumosity -tsa https://timestamp.geotrust.com/tsa
