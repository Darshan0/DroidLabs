import { Smartphone } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock.jsx';
import DocsReferences from '../../../components/DocsReferences.jsx';
import LabCue from '../../../components/LabCue.jsx';
import Quiz from '../../../components/Quiz.jsx';
import ActivityLifecycleExplorer from '../../../widgets/ActivityLifecycleExplorer.jsx';

const activityLifecyclePost = {
  id: 'activity-lifecycle',
  title: 'Activity Lifecycle: What Actually Runs When The User Leaves',
  category: 'Architecture',
  date: 'April 29, 2026',
  readTime: '13 min read',
  excerpt: 'Press Home, return, rotate, and watch the callback path through an Android Activity.',
  icon: <Smartphone />,
  widget: <ActivityLifecycleExplorer />,
  content: (
    <>
      <h2>An Activity Is A Contract With The System</h2>
      <p>
        Your Activity is not in charge of its own lifetime. Android is. The lifecycle callbacks are the system
        telling you how visible, focused, and disposable your screen currently is.
      </p>
      <p className="key-line">
        Important: lifecycle callbacks describe what the user and system can currently do with your screen.
      </p>
      <p>
        The mistake beginners make is treating `onCreate()` as the whole story. Real apps live in the transitions:
        losing focus, becoming invisible, returning from background, and being recreated after configuration changes.
      </p>
      <LabCue postId="activity-lifecycle" cue="launch">
        Play launch path in the lab
      </LabCue>

      <h2>The Happy Path</h2>
      <p>
        On a fresh launch, Android builds your screen in layers. First it creates the Activity object, then makes
        it visible, then gives it input focus. In the lab, watch the phone become visible only after `onStart()`
        and interactive only after `onResume()`.
      </p>
      <CodeBlock
        code={`
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }

    override fun onStart() {
        super.onStart()
        // Activity is visible.
    }

    override fun onResume() {
        super.onResume()
        // Activity is foreground and interactive.
    }
}
        `}
      />

      <h2>When The User Presses Home</h2>
      <p>
        Pressing Home does not necessarily destroy the Activity. It usually moves through `onPause()` and
        `onStop()`. The instance can remain in memory, ready to restart later.
      </p>
      <p>
        That distinction is practical. If you stop a camera preview in `onPause()`, it stops as soon as the Activity
        loses focus. If you release larger UI-only work in `onStop()`, it happens when the Activity is no longer
        visible.
      </p>
      <LabCue postId="activity-lifecycle" cue="background">
        Send the app to background
      </LabCue>
      <CodeBlock
        code={`
override fun onPause() {
    super.onPause()
    // Stop foreground-only work quickly.
}

override fun onStop() {
    super.onStop()
    // Release work that is only needed while visible.
}

override fun onRestart() {
    super.onRestart()
    // Called before onStart() when returning from Stopped.
}
        `}
      />

      <h2>Returning Is Not A Fresh Launch</h2>
      <p>
        If the stopped Activity comes back, Android calls `onRestart()`, then `onStart()`, then `onResume()`.
        `onCreate()` is not part of that path unless the old Activity was destroyed and recreated.
      </p>
      <p className="key-line">
        Important: do not put “every time the screen becomes usable” work only in `onCreate()`.
      </p>
      <LabCue postId="activity-lifecycle" cue="return">
        Bring the same Activity back
      </LabCue>
      <CodeBlock
        code={`
override fun onRestart() {
    super.onRestart()
    // Returning after being stopped.
}

override fun onStart() {
    super.onStart()
    locationUpdates.startIfVisible()
}

override fun onStop() {
    locationUpdates.stop()
    super.onStop()
}
        `}
      />

      <Quiz
        question="The user presses Home. Your Activity is no longer visible. Which callback is the right place for heavier visible-only cleanup?"
        options={['onPause()', 'onStop()', 'onCreate()']}
        answer="onStop()"
        explanation="onPause() should be brief. Once the Activity is not visible, onStop() is the better place for heavier visible-only cleanup."
      />

      <h2>The Production Lesson</h2>
      <p>
        Pair setup and teardown symmetrically. Work started for the Resumed state should stop in `onPause()`. Work
        started for the Started or visible state should stop in `onStop()`.
      </p>
      <p>
        Configuration changes are the other trap. Rotation often destroys and recreates the Activity. If data must
        survive that, keep it in a `ViewModel`, saved state, or persistent storage instead of only in Activity fields.
      </p>
      <LabCue postId="activity-lifecycle" cue="rotate">
        Rotate and recreate the Activity
      </LabCue>
      <DocsReferences
        links={[
          {
            label: 'The Activity lifecycle',
            href: 'https://developer.android.com/guide/components/activities/activity-lifecycle',
          },
          {
            label: 'Introduction to activities',
            href: 'https://developer.android.com/guide/components',
          },
        ]}
      />
    </>
  ),
};

export default activityLifecyclePost;
