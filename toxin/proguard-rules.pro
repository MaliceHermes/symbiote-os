# ProGuard rules for Symbiote Toxin
# Keep microG compatibility
-keep class microg.** { *; }
-dontwarn microg.**

# Keep Tor networking
-keep class org.torproject.** { *; }
-dontwarn org.torproject.**

# Keep Syncthing for Hive sync
-keep class com.syncpoint.** { *; }
-dontwarn com.syncpoint.**

# Keep Kotlin stdlib
-keep class kotlin.Metadata { *; }
-keepattributes *Annotation*

# Optimization
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses

# ════════════════════════════════════════════════════════════════════════════════
# SECURITY ENHANCEMENTS: Temporal Logic & Decidability Guards
# ════════════════════════════════════════════════════════════════════════════════

# Keep Toxin core components (ComponentState, ComponentStateTracker, ToxinApplicationState)
-keep class com.example.toxin.MainActivity { *; }
-keep class com.example.toxin.ComponentState* { *; }
-keep class com.example.toxin.ComponentStateTracker { *; }
-keep class com.example.toxin.ToxinApplicationState { *; }

# Keep enums (ComponentStatus)
-keepclassmembers enum com.example.toxin.ComponentStatus {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Remove Log calls in release builds (reduces debug surface)
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Reflection guards: Keep native method signatures
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep all Throwables and Exceptions (needed for error handling)
-keepclassmembers class * extends java.lang.Throwable {
    <init>(java.lang.String);
    <init>(java.lang.String, java.lang.Throwable);
    <init>(java.lang.Throwable);
}

# Remove source file attributes and line numbers (obfuscate stack traces)
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# Obfuscate package names to prevent simple reverse engineering
-repackageclasses com.example.toxin.obf

# Remove debug attributes
-stripattributes SourceFile,LineNumberTable,LocalVariableTable,LocalVariableTypeTable,Synthetic,Signature,Exceptions,MethodParameters

# Control verbosity
-verbose
-printmapping build/outputs/mapping/release/mapping.txt
-printseeds build/outputs/mapping/release/seeds.txt
-printusage build/outputs/mapping/release/usage.txt

# Keep data structures used by temporal logic
-keepclassmembers class com.example.toxin.ComponentState {
    public final java.lang.String name;
    public final com.example.toxin.ComponentStatus status;
    public final java.time.Instant startTime;
    public final java.time.Duration expectedDuration;
    public final java.time.Instant lastUpdate;
    public final java.lang.String errorMessage;
    public final java.lang.String progressMessage;
}

# Prevent JVM-level attacks on Boolean.parseBoolean, Integer.parseInt etc
-keepclassmembers class java.lang.String {
    public static *** valueOf(...);
}