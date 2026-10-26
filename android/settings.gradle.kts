pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Unity Ads repository
        maven {
            url = java.net.URI("https://unity3ddist.jfrog.io/artifactory/unity-mediation-mvn-prod-local/")
        }
    }
}

rootProject.name = "SkylineRush"
include(":app")
