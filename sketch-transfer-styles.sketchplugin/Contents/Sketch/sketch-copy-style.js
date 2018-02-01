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
    const copyStyle = copyInstanceSharedStyle( context, original, originalClass );
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

function copyStyle ( context ) {
  const objectID = context.selection[0].objectID();
  copyToPasteboard ( context, objectID + '' );
}

const searchLayerByIdInAllDocument = ( context, oid ) => {
  const pageLayers = context.document.currentPage().layers().slice();
  const orphanLayers = pageLayers.filter(layer => layer.class() != "MSArtboardGroup").filter(layer => layer.objectID() + '' == oid)
  const artboardLayers = pageLayers.filter(layer => layer.class() == "MSArtboardGroup").map(ab => ab.layers().slice().filter(layer => layer.objectID() + '' == oid))
  return [].concat.apply([], orphanLayers.concat(artboardLayers))[0];
}

function pasteStyle ( context ) {
  const objectIDFromPaste = getFromPasteboard( context );
  const original = searchLayerByIdInAllDocument( context, objectIDFromPaste );
  const targets = context.selection;
  if ( context.selection.length >= 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  }

}
