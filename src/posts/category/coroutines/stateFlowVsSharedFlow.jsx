import { Radio } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock.jsx';
import DocsReferences from '../../../components/DocsReferences.jsx';
import LabCue from '../../../components/LabCue.jsx';
import Quiz from '../../../components/Quiz.jsx';
import FlowChoiceWidget from '../../../widgets/FlowChoiceWidget.jsx';

const stateFlowVsSharedFlowPost = {
  id: 'stateflow-vs-sharedflow',
  title: 'StateFlow vs SharedFlow: State, Events, And Replay',
  category: 'Coroutines',
  date: 'April 29, 2026',
  readTime: '14 min read',
  excerpt: 'Tune replay, buffer, and collectors to see when Android UI should use StateFlow or SharedFlow.',
  icon: <Radio />,
  widget: <FlowChoiceWidget />,
  content: (
    <>
      <h2>The First Question Is Not API. It Is Meaning.</h2>
      <p>
        `StateFlow` and `SharedFlow` are both hot flows, but they are not interchangeable. The first question is:
        are you modeling a durable fact about the screen, or a moment that should be delivered to listeners?
      </p>
      <p className="key-line">
        Important: choose the flow by the meaning of the data, not by which API feels more flexible.
      </p>
      <LabCue postId="stateflow-vs-sharedflow" cue="state">
        Show StateFlow as one current value
      </LabCue>
      <p>
        State is something a new collector must know immediately: current user, loading state, selected filter,
        validation errors. Events are things that happen: navigate, show a snackbar, refresh tick, invalidate cache.
      </p>

      <h2>StateFlow: One Current Truth</h2>
      <p>
        A `StateFlow` always has a current value. A new collector receives that current value first, then receives
        later updates. That makes it a strong default for ViewModel UI state.
      </p>
      <p>
        This “current value” property is why `StateFlow` is so useful for rendering. The UI can disappear during a
        configuration change, return with a new collector, and still receive the latest model without asking the
        repository to rerun everything.
      </p>
      <LabCue postId="stateflow-vs-sharedflow" cue="state-late">
        Add a late collector to StateFlow
      </LabCue>
      <CodeBlock
        code={`
class ProfileViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun onProfileLoaded(profile: Profile) {
        _uiState.value = ProfileUiState.Ready(profile)
    }
}

lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state ->
            render(state)
        }
    }
}
        `}
      />

      <h2>SharedFlow: Broadcast With Knobs</h2>
      <p>
        `SharedFlow` is the configurable generalization. You choose how many old values to replay, how much extra
        buffer exists, and what happens when the buffer fills. That flexibility is power, but it also means the
        semantics are your responsibility.
      </p>
      <p className="key-line">
        Important: `replay = 0` means late collectors do not get old events. `replay = 1` means they do.
      </p>
      <LabCue postId="stateflow-vs-sharedflow" cue="shared-event">
        Show SharedFlow event mode
      </LabCue>
      <CodeBlock
        code={`
class RefreshBus {
    private val _ticks = MutableSharedFlow<Unit>(
        replay = 0,
        extraBufferCapacity = 1
    )
    val ticks: SharedFlow<Unit> = _ticks.asSharedFlow()

    fun requestRefresh() {
        _ticks.tryEmit(Unit)
    }
}
        `}
      />

      <h2>The Decision Table</h2>
      <p>
        Use `StateFlow` for screen state because state should be replayed. Use `SharedFlow` for fan-out signals,
        periodic ticks, refresh requests, analytics pings, or events where the subscription timing matters.
      </p>
      <LabCue postId="stateflow-vs-sharedflow" cue="shared-replay">
        Turn replay on for late collectors
      </LabCue>
      <CodeBlock
        code={`
// UI state: keep the latest truth.
private val _state = MutableStateFlow(SearchState())
val state = _state.asStateFlow()

// Event stream: active collectors hear events.
private val _effects = MutableSharedFlow<SearchEffect>(replay = 0)
val effects = _effects.asSharedFlow()

suspend fun onSearchFailed() {
    _effects.emit(SearchEffect.ShowSnackbar("Search failed"))
}
        `}
      />

      <Quiz
        question="A new screen collector appears after the latest user profile loaded. It must render the latest profile immediately. Which flow shape fits?"
        options={['MutableSharedFlow(replay = 0)', 'MutableStateFlow(initialState)', 'callbackFlow without stateIn']}
        answer="MutableStateFlow(initialState)"
        explanation="The screen needs the latest durable state, not just future events. StateFlow gives the new collector the current value immediately."
      />

      <h2>Rule Of Thumb</h2>
      <p>
        Use `StateFlow` when the sentence starts with “the current screen state is...” Use `SharedFlow` when the
        sentence starts with “tell all active listeners that something happened...”
      </p>
      <p className="key-line">
        If collecting it twice should repeat a side effect, be suspicious. You may be treating an event like state.
      </p>
      <DocsReferences
        links={[
          {
            label: 'StateFlow and SharedFlow',
            href: 'https://developer.android.com/kotlin/flow/stateflow-and-sharedflow',
          },
          {
            label: 'Kotlin flows on Android',
            href: 'https://developer.android.com/kotlin/flow',
          },
        ]}
      />
    </>
  ),
};

export default stateFlowVsSharedFlowPost;
