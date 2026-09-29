package com.elroybenjamins.cartcrown.uiprobe;

import android.app.Activity;
import android.app.Instrumentation;
import android.app.UiAutomation;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.graphics.Rect;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Base64;
import android.util.Xml;
import android.view.accessibility.AccessibilityNodeInfo;
import org.xmlpull.v1.XmlSerializer;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

/** Fresh read-only snapshot: unlike shell uiautomator dump, does not wait for an
 * animated game to become idle and cannot accidentally return yesterday's file.
 * Runs in its own test package, not the game process. Uses only public SDK APIs. */
public final class HierarchyProbe extends Instrumentation {
    private String request;
    private int nodeCount;
    @Override public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        request = arguments == null ? "" : arguments.getString("request", "");
        start();
    }
    @Override public void onStart() {
        Bundle output = new Bundle();
        try {
            UiAutomation automation = getUiAutomation(UiAutomation.FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES);
            AccessibilityServiceInfo info = automation.getServiceInfo();
            info.flags |= AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
                | AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS;
            automation.setServiceInfo(info);
            AccessibilityNodeInfo root = null;
            for (int i = 0; i < 10 && root == null; i++) {
                root = automation.getRootInActiveWindow();
                if (root == null) SystemClock.sleep(100);
            }
            if (root == null) throw new IllegalStateException("No active native window");
            if (!"com.elroybenjamins.cartcrown".contentEquals(root.getPackageName())) {
                root.recycle();
                throw new IllegalStateException("The game is not the active window");
            }
            StringWriter writer = new StringWriter();
            XmlSerializer xml = Xml.newSerializer();
            xml.setOutput(writer);
            xml.startDocument("UTF-8", true);
            xml.startTag("", "hierarchy");
            xml.attribute("", "request", request);
            writeNode(xml, root, 0);
            root.recycle();
            xml.endTag("", "hierarchy");
            xml.endDocument();
            byte[] bytes = writer.toString().getBytes(StandardCharsets.UTF_8);
            if (bytes.length > 600000) throw new IllegalStateException("UI snapshot too large");
            output.putString("hierarchy_b64", Base64.encodeToString(bytes, Base64.NO_WRAP));
            finish(Activity.RESULT_OK, output);
        } catch (Exception error) {
            output.putString("probe_error", error.toString());
            finish(Activity.RESULT_CANCELED, output);
        }
    }
    private static String safe(CharSequence value) {
        return value == null ? "" : value.toString().replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
    }
    private void writeNode(XmlSerializer xml, AccessibilityNodeInfo node, int depth) throws Exception {
        if (depth > 80 || ++nodeCount > 4000) throw new IllegalStateException("UI tree limit exceeded");
        if (!node.isVisibleToUser()) return;
        Rect bounds = new Rect();
        node.getBoundsInScreen(bounds);
        xml.startTag("", "node");
        xml.attribute("", "text", safe(node.getText()));
        xml.attribute("", "content-desc", safe(node.getContentDescription()));
        xml.attribute("", "resource-id", safe(node.getViewIdResourceName()));
        xml.attribute("", "class", safe(node.getClassName()));
        xml.attribute("", "clickable", String.valueOf(node.isClickable()));
        xml.attribute("", "enabled", String.valueOf(node.isEnabled()));
        xml.attribute("", "selected", String.valueOf(node.isSelected()));
        xml.attribute("", "scrollable", String.valueOf(node.isScrollable()));
        xml.attribute("", "bounds", "[" + bounds.left + "," + bounds.top + "][" + bounds.right + "," + bounds.bottom + "]");
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) { writeNode(xml, child, depth + 1); child.recycle(); }
        }
        xml.endTag("", "node");
    }
}
