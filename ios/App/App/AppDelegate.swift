import UIKit
import Capacitor
import FirebaseCore

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()

        let brandBlue = UIColor(red: 86.0 / 255.0, green: 105.0 / 255.0, blue: 255.0 / 255.0, alpha: 1.0)

        window?.backgroundColor = brandBlue
        window?.rootViewController?.view.backgroundColor = brandBlue

        DispatchQueue.main.async { [weak self] in
            guard let self = self,
                  let window = self.window else { return }

            // Keep native iOS edge-swipe back/forward gestures enabled.
            if let bridgeViewController = window.rootViewController as? CAPBridgeViewController {
                bridgeViewController.webView?.allowsBackForwardNavigationGestures = true
            }
        }

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        if let bridgeViewController = window?.rootViewController as? CAPBridgeViewController {
            bridgeViewController.webView?.allowsBackForwardNavigationGestures = true
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        if let scheme = url.scheme?.lowercased(), scheme == "pechpechoo" {
            let urlString = url.absoluteString
            DispatchQueue.main.async { [weak self] in
                // 1. Dismiss presented in-app browser modals
                self?.window?.rootViewController?.dismiss(animated: true, completion: nil)
                for scene in UIApplication.shared.connectedScenes {
                    if let windowScene = scene as? UIWindowScene {
                        for window in windowScene.windows {
                            window.rootViewController?.dismiss(animated: true, completion: nil)
                        }
                    }
                }

                // 2. Direct JavaScript injection into WKWebView
                let escapedUrl = urlString.replacingOccurrences(of: "'", with: "\\'")
                let js = """
                (function() {
                    var deepLinkUrl = '\(escapedUrl)';
                    window.dispatchEvent(new CustomEvent('pechpechoo:deep-link', { detail: deepLinkUrl }));
                    if (window.PechPechooRouteDeepLink) {
                        window.PechPechooRouteDeepLink(deepLinkUrl);
                    }
                })();
                """
                if let bridgeVC = self?.window?.rootViewController as? CAPBridgeViewController {
                    bridgeVC.webView?.evaluateJavaScript(js, completionHandler: nil)
                }
            }
        }
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        NotificationCenter.default.post(name: Notification.Name.init("capacitorDidReceiveRemoteNotification"), object: completionHandler, userInfo: userInfo)
    }

}
