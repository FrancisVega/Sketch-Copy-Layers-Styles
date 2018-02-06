function copyInstanceSharedTextStyle ( context, instance ) {
  return context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
}

function copyInstanceSharedLayerStyle ( context, instance ) {
  return context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
}

function pasteInstanceSharedStyle ( layer, sharedStyle ) {
  return layer.style = sharedStyle.newInstance();
}

function copyInstanceSharedStyle ( context, instance, klass ) {
  if ( klass == 'MSTextLayer' )
    return copyInstanceSharedTextStyle( context, instance );
  if ( klass == 'MSShapeGroup' )
    return copyInstanceSharedLayerStyle( context, instance );
  return null;
}

function transferStyle ( context, original, targets ) {
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

const layerById = ( context, layerID ) => {
  const z = context.document.pages().slice().map(item => item.children().slice().filter(layer => layer.objectID() + "" == layerID ))
  return [].concat.apply([], z)[0]
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
  const original = layerById ( context, objectIDFromPaste )
  const targets = context.selection;
  if ( context.selection.length >= 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  }
}
