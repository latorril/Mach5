#! /bin/bash -ex
#ZXPSignCmd -selfSignedCert <countryCode> <stateOrProvince> <organization> <commonName> <password> <outputPath.p12> [options]
./ZXPSignCmd -selfSignedCert US CA lumoslabs "Lumos Labs, Inc." lumosity cert.p12
