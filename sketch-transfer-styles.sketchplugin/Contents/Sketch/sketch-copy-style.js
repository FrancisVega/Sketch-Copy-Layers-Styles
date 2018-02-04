// Functions
const copyInstanceSharedTextStyle = ( context, instance ) => context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
const copyInstanceSharedLayerStyle = ( context, instance ) => context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
const pasteInstanceSharedStyle = ( layer, sharedStyle ) => layer.style = sharedStyle.newInstance();
const copyInstanceSharedStyle = ( context, instance, klass ) => {
  if ( klass == 'MSTextLayer' )
    return copyInstanceSharedTextStyle( context, instance );
  if ( klass == 'MSShapeGroup' )
    return copyInstanceSharedLayerStyle( context, instance );
  return null;
}

const transferStyle = ( context, original, targets ) => {
  // Filter target layers by original class
  const originalClass = original.class();
  const targetsFiltered = targets.slice().filter( layer => layer.class() == originalClass );

  // Processing targets layers
  targetsFiltered.map( layer => {
    const klass = original.class();
    copyStyle = copyInstanceSharedStyle( context, original, klass );
    pasteInstanceSharedStyle ( layer, copyStyle );
  });
}

const copyToPasteboard = ( context, string ) => {
    const pasteboard = NSPasteboard.generalPasteboard();
    pasteboard.clearContents();
    pasteboard.setString_forType( NSMutableString.stringWithString( string ), NSPasteboardTypeString );
}

const getFromPasteboard = ( context ) => {
  const pasteboard = NSPasteboard.generalPasteboard();
  const pasteboardItems = pasteboard.pasteboardItems();
  if (pasteboardItems.count() > 0) {
    const string = pasteboardItems.firstObject().stringForType( NSPasteboardTypeString );
    if (string) {
      return string;
    }
  }
}

const findLayersByID = ( oid, scope ) => {
  const predicate = NSPredicate.predicateWithFormat( "objectID == %@", oid );
  return scope.filteredArrayUsingPredicate( predicate );
}

//
// Devuelve la capa encontrada por ID
// En caso de no encontrarla, devuelve nil
//
function layerByIDInContext ( layerID, artboard ) {
  const artboardLayers = artboard.layers();
  if( artboardLayers.length > 0 ) {
    const layerByID = findLayersByID( layerID, artboardLayers );
    if ( layerByID.length > 0 ) {
      return layerByID[0];
    } else {
      return nil;
    }
  } else {
    return nil;
  }
}


const findLayersByID = ( oid, scope ) => {
  const predicate = NSPredicate.predicateWithFormat( "objectID == %@", oid );
  return scope.filteredArrayUsingPredicate( predicate );
}

// Devuelve la capa encontrada por ID en un scope
// En caso de no encontrarla, devuelve nil
function layerByID ( layerID, scope ) {
    const layers = scope.layers();
    if( layers.length > 0 ) {
        const layerByID = findLayersByID( layerID, layers );
        if ( layerByID.length == 1 ) {
            return layerByID[0];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

// Devuelve la capa encontrada por ID en los artboards de la página actual
function layerByIDInArtboards ( layerID, page ) {
    const artboards = page.layers();
    for(let i=0; i<artboards.length; ++i) {
        return layerByID( layerID, artboards[i] ); 
    }
}


// Buscamos la capa en la página
function findLayerIdByPage ( layerID, page ) {
    const orphans = layerByID( layerID, page )
    const inartboards = layerByIDInArtboards( layerID, page )
    return orphans || inartboards;
}

function findLayerByIdInDocument ( layerID ) {
    return context.document.pages().slice().map( page => findLayerIdByPage( layerID, page ) ).filter( idPage => idPage != null )[0] || null;
}


log(findLayerByIdInDocument( "7DB73C9F-6730-4C03-87D8-59F00AF8CDAB" ));





















function copyStyle ( context ) {
  const objectID = context.selection[0].objectID();
  copyToPasteboard ( context, objectID + '' );
}

const searchLayerByIdInAllDocument = ( context, oid ) => {
  const orphanLayers = context.document.currentPage().layers().slice().filter(layer => layer.class() != "MSArtboardGroup").filter(layer => layer.objectID()+"" == oid)
  const artboardLayers = context.document.currentPage().layers().slice().filter(layer => layer.class() == "MSArtboardGroup").map(ab => ab.layers().slice().filter(layer => layer.objectID()+"" == oid))
  return [].concat.apply([], orphanLayers.concat(artboardLayers))[0];
}

function pasteStyle ( context ) {
  // Layers
  const objectIDFromPaste = getFromPasteboard( context );
  const original = searchLayerByIdInAllDocument( context, objectIDFromPaste );
  const targets = context.selection;
  if ( context.selection.length >= 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  }

}
