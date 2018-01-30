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

function transfer ( context ) {
  // Layers
  const SELECTION = context.selection;
  const original = SELECTION[0];
  const targets = SELECTION.slice(1, SELECTION.length);

  if ( SELECTION.length > 1 ){
    transferStyle( context, original, targets );
    context.document.showMessage( '💅🏻 Styles copied!' );
  } else {
    context.document.showMessage( '💩 Select one original layer and target layers' );
  }
}
