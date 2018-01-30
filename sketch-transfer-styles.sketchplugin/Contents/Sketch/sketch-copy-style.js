// Functions
const allLayersAreEqual = layers => {
  const firstClass = layers[0].class();
  const filteredLayers = layers.slice().filter( layer => layer.class() != firstClass );
  return !filteredLayers.length;
}
const copyInstanceSharedTextStyle = (context, instance) => context.document.documentData().layerTextStyles().sharedStyleForInstance( instance.style() );
const copyInstanceSharedLayerStyle = (context, instance) => context.document.documentData().layerStyles().sharedStyleForInstance( instance.style() );
const pasteInstanceSharedStyle = ( layer, sharedStyle ) => layer.style = sharedStyle.newInstance();

// Main Function
const transferStyle = ( context, original, targets ) => {
  // Processing targets layers
  targets.slice().map( layer => {
    // Get layers from original
    let copyStyle;
    if (original.class() == 'MSTextLayer') {
      copyStyle = copyInstanceSharedTextStyle( context, original );
    }
    if (original.class() == 'MSShapeGroup') {
      copyStyle = copyInstanceSharedLayerStyle( context, original );
    }
    pasteInstanceSharedStyle ( layer, copyStyle );
  });
}

function transfer (context) {
  // Consts
  const SELECTION = context.selection;

  // Layers
  const original = SELECTION[0];
  const targets = SELECTION.slice(1, SELECTION.length);

  if (SELECTION.length > 1){
    if (allLayersAreEqual(SELECTION)) {
      // Transfer Style!
      transferStyle( context, original, targets );
      context.document.showMessage("💅🏻 Styles copied!");
    } else {
    context.document.showMessage("💩 Mixing layers is not ALLOWED! :P");
    }
  } else {
    context.document.showMessage("💩 Select one original layer and target layers");
  }
}
