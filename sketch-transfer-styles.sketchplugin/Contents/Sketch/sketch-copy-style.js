const copyInstanceSharedTextStyle = ( context, instance ) => context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
const copyInstanceSharedLayerStyle = ( context, instance ) => context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
const pasteInstanceSharedStyle = ( layer, sharedStyle ) => {
    layer.style = sharedStyle.newInstance();
}

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
    const copyStyle = copyInstanceSharedStyle( context, original, klass );
    pasteInstanceSharedStyle ( layer, copyStyle );
  });
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

function findLayerIdByPage ( layerID, page ) {
    const orphans = layerByID( layerID, page )
    const inartboards = layerByIDInArtboards( layerID, page )
    return orphans || inartboards;
}

function findLayerByIdInDocument ( context, layerID ) {
  log("context => " + context)
  log("document => " + context.document)
  log("pages => " + context.document.pages())
    return context.document.pages().slice().map( page => findLayerIdByPage( layerID, page ) ).filter( idPage => idPage != null )[0] || null;
}

function getFromPasteboard ( context ) {
  const pasteboard = NSPasteboard.generalPasteboard();
  const pasteboardItems = pasteboard.pasteboardItems();
  if (pasteboardItems.count() > 0) {
    const string = pasteboardItems.firstObject().stringForType( NSPasteboardTypeString );
    if (string) {
      return string;
    }
  }
}

function copyStyle ( context ) {
  const objectID = context.selection[0].objectID().toString();
  copyToPasteboard ( context, objectID );
}

function copyToPasteboard ( context, string ) {
    const pasteboard = NSPasteboard.generalPasteboard();
    pasteboard.clearContents();
    pasteboard.setString_forType( NSMutableString.stringWithString( string ), NSPasteboardTypeString );
}

function pasteStyle ( context ) {
  const objectIDFromPaste = getFromPasteboard( context );
  const original = findLayerByIdInDocument ( context, objectIDFromPaste );
  const targets = context.selection;
  if ( context.selection.length >= 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  }
}
