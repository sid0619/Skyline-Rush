# Keep Unity Ads SDK classes from obfuscation issues
-keep class com.unity3d.ads.** { *; }
-keep interface com.unity3d.ads.** { *; }
-keep class com.unity3d.services.** { *; }
-keep interface com.unity3d.services.** { *; }
-dontwarn com.unity3d.services.**
-dontwarn com.unity3d.ads.**

# Keep Compose & DataStore models
-keepclassmembers class * {
    @androidx.compose.runtime.Composable *;
}
