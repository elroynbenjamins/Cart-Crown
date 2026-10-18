const assert = require('node:assert/strict');
const fs = require('node:fs');
const plugin = require('../plugins/withFrescoEarlyInit');
const apply = plugin.injectEarlyFrescoInit;
const marker = 'com.facebook.drawee.backends.pipeline.Fresco.initialize(this)';

const kotlin = [
  'class MainApplication : Application(), ReactApplication {',
  '  override fun onCreate() {',
  '    super.onCreate()',
  '    loadReactNative(this)',
  '    ApplicationLifecycleDispatcher.onApplicationCreate(this)',
  '  }',
  '}'
].join('\n');
const patchedKotlin = apply(kotlin, 'kt');
assert.ok(patchedKotlin.includes('if (!com.facebook.drawee.backends.pipeline.Fresco.hasBeenInitialized())'));
assert.ok(patchedKotlin.indexOf(marker) > patchedKotlin.indexOf('super.onCreate()'));
assert.ok(patchedKotlin.indexOf(marker) < patchedKotlin.indexOf('loadReactNative(this)'));
assert.equal(patchedKotlin.split(marker).length, 2, 'Native startup init must be inserted once.');
assert.equal(apply(patchedKotlin, 'kt'), patchedKotlin, 'Expo prebuild plugin must be idempotent.');

const java = [
  'public class MainApplication extends Application {',
  '  public void onCreate() {',
  '    super.onCreate();',
  '    loadReactNative(this);',
  '  }',
  '}'
].join('\n');
const patchedJava = apply(java, 'java');
assert.ok(patchedJava.includes(marker + ';'));
assert.equal(patchedJava.split(marker).length, 2);
assert.equal(apply(patchedJava, 'java'), patchedJava);

assert.throws(() => apply('class MainApplication {}', 'kt'), /Could not locate Android MainApplication.onCreate/);
assert.throws(() => apply(kotlin, 'swift'), /Kotlin or Java/);

const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
assert.ok(config.expo.plugins.includes('./plugins/withFrescoEarlyInit'),
  'Android prebuild must run the plugin; otherwise clean native builds lose this fix.');
console.log('PASS: Fresco startup init precedes React Fabric, survives clean prebuild and is idempotent.');
