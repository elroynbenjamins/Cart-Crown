const { withMainApplication } = require('expo/config-plugins');

/**
 * RN Fabric can preallocate an Image view before the Fresco controller
 * supplier is initialized on a cold Android restart. Initialize once in
 * Application.onCreate, before loadReactNative starts React Fabric.
 *
 * This is a prebuild plugin so expo prebuild --clean preserves the fix.
 */
function injectEarlyFrescoInit(contents, language) {
  const marker = 'com.facebook.drawee.backends.pipeline.Fresco.initialize(this)';
  if (contents.includes(marker)) return contents;

  const kotlin = language === 'kt' || language === 'kotlin';
  const java = language === 'java';
  if (!kotlin && !java) {
    throw new Error('Fresco early init requires a Kotlin or Java Android MainApplication.');
  }

  const method = kotlin ? 'override fun onCreate()' : 'public void onCreate()';
  const start = contents.indexOf(method);
  if (start < 0) throw new Error('Could not locate Android MainApplication.onCreate.');
  const superCall = kotlin ? 'super.onCreate()' : 'super.onCreate();';
  const at = contents.indexOf(superCall, start + method.length);
  const nextMethod = contents.indexOf(kotlin ? 'override fun ' : 'public void ', start + method.length);
  if (at < 0 || (nextMethod >= 0 && at > nextMethod)) {
    throw new Error('Could not locate super.onCreate in Android MainApplication.');
  }
  const check = 'com.facebook.drawee.backends.pipeline.Fresco.hasBeenInitialized()';
  const added = '\n    if (!' + check + ') {' +
    '\n      ' + marker + (kotlin ? '' : ';') +
    '\n    }';
  const output = contents.slice(0, at + superCall.length) +
    added + contents.slice(at + superCall.length);
  const frescoPosition = output.indexOf(marker);
  const reactStart = output.indexOf('loadReactNative(', start);
  if (reactStart !== -1 && reactStart < frescoPosition) {
    throw new Error('Fresco must be initialized before loadReactNative.');
  }
  return output;
}

function withFrescoEarlyInit(config) {
  return withMainApplication(config, config => {
    const { contents, language } = config.modResults;
    config.modResults.contents = injectEarlyFrescoInit(contents, language);
    return config;
  });
}

module.exports = withFrescoEarlyInit;
module.exports.injectEarlyFrescoInit = injectEarlyFrescoInit;
