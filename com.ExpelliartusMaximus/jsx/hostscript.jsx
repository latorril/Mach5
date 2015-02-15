/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/


function sayHello(){
    //http://www.ericson.net/files/illustrator-scripts/Export-Named-Artboards-as-PNG.jsx

var docRef = app.activeDocument;

// some globals
var nyt_png_info;         // layer to save our settings on

var nyt_png_ppi;
var nyt_png_prefix;      // file prefix
var nyt_png_base_path;    // base path

var nyt_png_exportPNG;
var nyt_png_exportAI;

var nyt_png_xml; 

var nyt_png_dlg;

var nyt_parse_success = false;

// get our info layer, or create it with some defaults
try {
    nyt_png_info = docRef.layers.getByName( 'nyt_png_info' );
  

} catch ( e ) {
    nyt_png_info = docRef.layers.add();
    nyt_png_info.name = 'nyt_png_info';
    //nyt_png_info.move(docRef.layers[ docRef.layers.length-1],ElementPlacement.PLACEAFTER);
    
    var nyt_png_info_xml = nyt_png_info.textFrames.add();
    
    var saved_data = new XML( '<nyt_prefs></nyt_prefs>' );
    saved_data.appendChild( new XML('<nyt_ppi>72</nyt_ppi>') );
    saved_data.appendChild( new XML('<nyt_prefix></nyt_prefix>') );
    saved_data.appendChild( new XML('<nyt_path>~/Desktop</nyt_path>') );
    saved_data.appendChild( new XML('<nyt_exportPNG>true</nyt_exportPNG>') );
    saved_data.appendChild( new XML('<nyt_exportAI>false</nyt_exportAI>') );

    nyt_png_info_xml.contents = saved_data.toXMLString();    
    
    // Make XML invisible in doc
    nyt_png_info.printable = false;
    nyt_png_info.visible = false;
    nyt_png_info.opacity = 0.0;
}




// get xml out of the 1 text item on that layer and parse it
if ( nyt_png_info.textFrames.length != 1 ) {
    Window.alert( 'Please delete the nyt_png_info layer and try again.' );

} else {     
    
    try {
        nyt_png_xml = new XML( nyt_png_info.textFrames[0].contents );
        nyt_png_ppi        = nyt_png_xml.nyt_ppi;
        nyt_png_prefix    = nyt_png_xml.nyt_prefix;
        nyt_png_base_path  = nyt_png_xml.nyt_path;
        nyt_png_exportPNG   = nyt_png_xml.nyt_exportPNG;
        nyt_png_exportAI   = nyt_png_xml.nyt_exportAI;
        nyt_parse_success = true;
    } catch ( e ) {
        Window.alert( 'Please delete the nyt_png_info layer and try again.' );
    }
}


if (nyt_parse_success) {
    nyt_show_png_dialog();
}

function nyt_show_png_dialog() {

    // figure out if there is stuff to process
    var num_artboards = docRef.artboards.length;
    var num_to_export = 0;

    for (var i = 0; i < num_artboards; i++ ) {
        var artboardName = docRef.artboards[i].name;
        if ( ! ( artboardName.match(  /^artboard/ ) || artboardName.match( /^\-/ ) )){
                num_to_export++;
        }
    }


    // Export dialog
    nyt_png_dlg = new Window('dialog', 'Export Artboards'); 

    // PANEL to hold options
    nyt_png_dlg.msgPnl = nyt_png_dlg.add('panel', undefined, ''); 


    // PREFIX GRP
    var prefixGrp = nyt_png_dlg.msgPnl.add('group', undefined, '');
    prefixGrp.orientation = 'row';
    prefixGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

    var prefixSt = prefixGrp.add('statictext', undefined, 'File prefix:'); 
    prefixSt.size = [100,20];

    var prefixEt = prefixGrp.add('edittext', undefined, nyt_png_prefix); 
    prefixEt.size = [ 300,20 ];


    // DIR GRP
    var dirGrp = nyt_png_dlg.msgPnl.add( 'group', undefined, '');
    dirGrp.orientation = 'row'
    dirGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

    var dirSt = dirGrp.add('statictext', undefined, 'Output directory:'); 
    dirSt.size = [ 100,20 ];

    var dirEt = dirGrp.add('edittext', undefined, nyt_png_base_path); 
    dirEt.size = [ 300,20 ];
    
    dirGrp.separator = dirGrp.add('panel');
    
    
    // EXPORTTYPE GRP
    var exportTypeGrp = nyt_png_dlg.msgPnl.add('group', undefined, '');
    exportTypeGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
    exportTypeGrp.orientation = 'row';
    //exportTypeGrp.alignChildren = 'left';
    
    var exportPNGRad = exportTypeGrp.add('radiobutton', undefined, 'PNG');
    var exportAIRad = exportTypeGrp.add('radiobutton', undefined, 'AI');
    
    exportPNGRad.value = ( nyt_png_exportPNG.toString() === 'true' );
    exportAIRad.value = ( nyt_png_exportAI.toString() === 'true' );
    
    exportAIRad.onClick = function() { 
        ppiGrp.enabled = false;
        }
    
    exportPNGRad.onClick = function() { 
        ppiGrp.enabled = true;
        }

    
    // PPI GRP
    var ppiGrp = nyt_png_dlg.msgPnl.add('group', undefined, '');
    ppiGrp.orientation = 'row';
    ppiGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];
    
    var ppiSt = ppiGrp.add('statictext', undefined, 'Custom DPI:'); 
    ppiSt.size = [100,20];
    
    var ppiInput = ppiGrp.add('edittext', undefined, '72');
    ppiInput.text = nyt_png_ppi;
    ppiInput.characters = 4;
    
    if ( exportPNGRad.value == false ){
        ppiGrp.enabled = false;
    }
    //ppiCbx.shortcutKey = 'p';
  

    //PROGRESS BAR
    nyt_png_dlg.progBar = nyt_png_dlg.msgPnl.add( 'progressbar', undefined, 0, 100 );
    nyt_png_dlg.progBar.size = [400,10];

    nyt_png_dlg.progLabel = nyt_png_dlg.msgPnl.add('statictext', undefined, 'Will export ' + num_to_export + ' of ' + num_artboards + ' artboards in document' ); 
    nyt_png_dlg.progLabel.size = [ 400,20 ];


    var chooseBtn = dirGrp.add('button', undefined, 'Choose ...' );
    chooseBtn.onClick = function() { nyt_png_base_path = Folder.selectDialog(); dirEt.text = nyt_png_base_path }


    nyt_png_dlg.btnPnl = nyt_png_dlg.add('group', undefined, ''); 
    nyt_png_dlg.btnPnl.orientation = 'row'

    nyt_png_dlg.btnPnl.cancelBtn = nyt_png_dlg.btnPnl.add('button', undefined, 'Cancel', {name:'cancel'});
    nyt_png_dlg.btnPnl.cancelBtn.onClick = function() { nyt_png_dlg.close() };


    nyt_png_dlg.btnPnl.okBtn = nyt_png_dlg.btnPnl.add('button', undefined, 'Export', {name:'ok'});
    nyt_png_dlg.btnPnl.okBtn.onClick = function() { 
        nyt_png_prefix = prefixEt.text; 
        nyt_png_ppi = ppiInput.text; 
        nyt_png_exportPNG = exportPNGRad.value;
        nyt_png_exportAI = exportAIRad.value;
        nyt_run_export( num_to_export);   
        };

    nyt_png_dlg.show();
}

function nyt_run_export( num_to_export ) {
    //do not ask user if they want to overwrite - of course they do...
    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
    
    var num_exported = 0;
    
    var num_artboards = docRef.artboards.length; 

    for (var i = 0; i < num_artboards; i++ ) {

        var artboardName = docRef.artboards[i].name;

        // Skip artboards that start with "Artboard" or that start with a dash (-) 
        
        if ( ! ( artboardName.match(  /^artboard/ ) || artboardName.match( /^\-/ ) )){
            
            //export PNG
            if ( nyt_png_exportPNG == true ){
                var png_ppi;
                if ( nyt_png_ppi != '' ){
                    png_ppi = (nyt_png_ppi/72)*100;
                }
                else png_ppi = 100;
                
                //$.writeln( artboardName );

                var destFile = new File( nyt_png_base_path + "/" + nyt_png_prefix + artboardName  + ".png");    

                var optionsPNG24 = new ExportOptionsPNG24();
                optionsPNG24.artBoardClipping = true;
                optionsPNG24.matte = true;
                optionsPNG24.horizontalScale = png_ppi;
                optionsPNG24.verticalScale = png_ppi;

                docRef.artboards.setActiveArtboardIndex(i);
                
                docRef.exportFile (destFile, ExportType.PNG24, optionsPNG24);
            }
            
            //export AI
            if ( nyt_png_exportAI == true ){
                var destFileAI = new File( nyt_png_base_path + "/" + docRef.name + ".ai");

                var optionsAI = new IllustratorSaveOptions();
                //docRef.artboards.setActiveArtboardIndex(i);

                var range = '';
                var currentArtBoardNumber = i + 1;
                optionsAI.saveMultipleArtboards = true;
                optionsAI.artboardRange = range.concat( currentArtBoardNumber, '-', currentArtBoardNumber );
                docRef.saveAs(destFileAI, optionsAI);
            }
            
            num_exported++;
            
            nyt_png_dlg.progLabel.text = 'Exported ' + num_exported + ' of ' + num_to_export;
            nyt_png_dlg.progBar.value = num_exported / num_to_export * 100;
            nyt_png_dlg.update();
            ///progBar.notify("onDraw");
            
        }
    }
    
    // turn alerts back on for future use
    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    
    nyt_png_xml.nyt_ppi = nyt_png_ppi;
    nyt_png_xml.nyt_path = nyt_png_base_path;
    nyt_png_xml.nyt_prefix = nyt_png_prefix;
    nyt_png_xml.nyt_exportPNG = nyt_png_exportPNG;
    nyt_png_xml.nyt_exportAI = nyt_png_exportAI;
    
    nyt_png_info.textFrames[0].contents = nyt_png_xml.toXMLString();
    nyt_png_dlg.close();
}

}
