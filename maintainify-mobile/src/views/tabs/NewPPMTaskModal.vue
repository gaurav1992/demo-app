<!-- NewPPMTaskModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>New PPM Task</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <form @submit.prevent="handleSubmit">
        <ion-segment v-model="selectedTab" class="form-tabs">
          <ion-segment-button value="location">
            <ion-label>Location</ion-label>
          </ion-segment-button>
          <ion-segment-button value="category">
            <ion-label>Category</ion-label>
          </ion-segment-button>
          <ion-segment-button value="details">
            <ion-label>Details</ion-label>
          </ion-segment-button>
          <ion-segment-button value="assign">
            <ion-label>Assign</ion-label>
          </ion-segment-button>
          <ion-segment-button value="schedule">
            <ion-label>Schedule</ion-label>
          </ion-segment-button>
          <ion-segment-button value="media">
            <ion-label>Media</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div class="form-content">
          <!-- Location Tab -->
          <div v-if="selectedTab === 'location'" class="tab-content">
            <ion-item>
              <ion-label position="stacked">Building</ion-label>
              <ion-select v-model="formData.building" interface="popover">
                <ion-select-option v-for="building in buildings" :key="building" :value="building">
                  {{ building }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Location</ion-label>
              <ion-select v-model="formData.location" interface="popover">
                <ion-select-option v-for="location in locations" :key="location" :value="location">
                  {{ location }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Asset</ion-label>
              <ion-select v-model="formData.asset" interface="popover">
                <ion-select-option v-for="asset in assets" :key="asset" :value="asset">
                  {{ asset }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <!-- Category Tab -->
          <div v-if="selectedTab === 'category'" class="tab-content">
            <ion-item>
              <ion-label position="stacked">Category</ion-label>
              <ion-select v-model="formData.category" interface="popover">
                <ion-select-option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <!-- Details Tab -->
          <div v-if="selectedTab === 'details'" class="tab-content">
            <ion-item>
              <ion-label position="stacked">Title</ion-label>
              <ion-input v-model="formData.title" type="text"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Details</ion-label>
              <ion-textarea 
                v-model="formData.details" 
                rows="6"
                placeholder="Enter task details..."
              ></ion-textarea>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Priority</ion-label>
              <ion-select v-model="formData.priority" interface="popover">
                <ion-select-option value="high">High</ion-select-option>
                <ion-select-option value="medium">Medium</ion-select-option>
                <ion-select-option value="low">Low</ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <!-- Assign Tab -->
          <div v-if="selectedTab === 'assign'" class="tab-content">
            <ion-item>
              <ion-label position="stacked">Assign To</ion-label>
              <ion-select v-model="formData.assignedTo" interface="popover">
                <ion-select-option v-for="member in teamMembers" :key="member" :value="member">
                  {{ member }}
                </ion-select-option>
              </ion-select>
            </ion-item>
          </div>

          <!-- Schedule Tab -->
          <div v-if="selectedTab === 'schedule'" class="tab-content">
            <!-- All Day Toggle -->
            <ion-item>
              <ion-label>All Day</ion-label>
              <ion-toggle v-model="formData.schedule.isAllDay"></ion-toggle>
            </ion-item>

            <!-- Start Date -->
            <ion-item>
              <ion-label position="stacked">Start Date</ion-label>
              <ion-datetime 
                v-model="formData.schedule.startDate"
                presentation="date"
                :min="minDate"
              ></ion-datetime>
            </ion-item>

            <!-- Time (if not All Day) -->
            <ion-item v-if="!formData.schedule.isAllDay">
              <ion-label position="stacked">Time</ion-label>
              <ion-datetime 
                v-model="formData.schedule.time"
                presentation="time"
              ></ion-datetime>
            </ion-item>

            <!-- Recurrence Settings -->
            <ion-item-divider>
              <ion-label>Recurrence</ion-label>
            </ion-item-divider>

            <div class="recurrence-section">
              <ion-item>
                <ion-label>Repeat every</ion-label>
                <ion-input 
                  type="number" 
                  v-model="formData.schedule.interval" 
                  min="1"
                  class="interval-input"
                ></ion-input>
                <ion-select 
                  v-model="formData.schedule.intervalUnit"
                  interface="popover"
                  class="interval-unit"
                >
                  <ion-select-option value="day">Day(s)</ion-select-option>
                  <ion-select-option value="week">Week(s)</ion-select-option>
                  <ion-select-option value="month">Month(s)</ion-select-option>
                  <ion-select-option value="year">Year(s)</ion-select-option>
                </ion-select>
              </ion-item>

              <!-- End Recurrence Options -->
              <ion-item>
                <ion-label>Ends</ion-label>
                <ion-select v-model="formData.schedule.endType" interface="popover">
                  <ion-select-option value="never">Never</ion-select-option>
                  <ion-select-option value="on">On Date</ion-select-option>
                  <ion-select-option value="after">After Occurrences</ion-select-option>
                </ion-select>
              </ion-item>

              <!-- End Date (if endType is 'on') -->
              <ion-item v-if="formData.schedule.endType === 'on'">
                <ion-label position="stacked">End Date</ion-label>
                <ion-datetime 
                  v-model="formData.schedule.endDate"
                  presentation="date"
                  :min="formData.schedule.startDate"
                ></ion-datetime>
              </ion-item>

              <!-- Number of Occurrences (if endType is 'after') -->
              <ion-item v-if="formData.schedule.endType === 'after'">
                <ion-label position="stacked">Number of occurrences</ion-label>
                <ion-input 
                  type="number" 
                  v-model="formData.schedule.occurrences"
                  min="1"
                ></ion-input>
              </ion-item>
            </div>
          </div>

          <!-- Media Tab -->
          <div v-if="selectedTab === 'media'" class="tab-content">
            <ion-item>
              <div class="file-upload">
                <input 
                  type="file" 
                  multiple 
                  @change="handleFileUpload" 
                  ref="fileInput"
                  class="file-input"
                >
                <ion-button expand="block" @click="triggerFileInput">
                  <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
                  Upload Files
                </ion-button>
              </div>
            </ion-item>

            <!-- File Preview -->
            <div class="file-preview" v-if="selectedFiles.length">
              <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
                <ion-icon :icon="documentOutline"></ion-icon>
                <span>{{ file.name }}</span>
                <ion-button fill="clear" @click="removeFile(index)">
                  <ion-icon :icon="closeCircleOutline" color="danger"></ion-icon>
                </ion-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Navigation -->
        <div class="form-navigation">
          <ion-button 
            fill="clear"
            @click="previousTab"
            :disabled="isFirstTab"
          >
            Previous
          </ion-button>

          <ion-button 
            v-if="isLastTab"
            type="submit"
            color="primary"
          >
            Create Task
          </ion-button>
          <ion-button 
            v-else
            @click="nextTab"
            color="primary"
          >
            Next
          </ion-button>
        </div>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonDatetime,
  IonToggle
} from '@ionic/vue'
import {
  closeOutline,
  cloudUploadOutline,
  documentOutline,
  closeCircleOutline
} from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'save'])

// Mock data (replace with actual data)
const buildings = ['Building A', 'Building B', 'Building C']
const locations = ['Floor 1', 'Floor 2', 'Floor 3']
const assets = ['Asset 1', 'Asset 2', 'Asset 3']
const categories = ['Category 1', 'Category 2', 'Category 3']
const teamMembers = ['John Doe', 'Jane Smith', 'Bob Johnson']

const tabs = ['location', 'category', 'details', 'assign', 'schedule', 'media']
const selectedTab = ref('location')
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

const formData = ref({
  building: '',
  location: '',
  asset: '',
  category: '',
  title: '',
  details: '',
  priority: '',
  assignedTo: '',
  schedule: {
    isAllDay: false,
    startDate: '',
    time: '',
    interval: 1,
    intervalUnit: 'day',
    endType: 'never',
    endDate: '',
    occurrences: 1
  },
  files: [] as File[]
})

// Computed properties
const currentTabIndex = computed(() => tabs.indexOf(selectedTab.value))
const isFirstTab = computed(() => currentTabIndex.value === 0)
const isLastTab = computed(() => currentTabIndex.value === tabs.length - 1)
const minDate = computed(() => new Date().toISOString())

// Methods
const nextTab = () => {
  if (!isLastTab.value) {
    selectedTab.value = tabs[currentTabIndex.value + 1]
  }
}

const previousTab = () => {
  if (!isFirstTab.value) {
    selectedTab.value = tabs[currentTabIndex.value - 1]
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)]
    formData.value.files = selectedFiles.value
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  formData.value.files = selectedFiles.value
}

const handleSubmit = () => {
  emit('save', formData.value)
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    building: '',
    location: '',
    asset: '',
    category: '',
    title: '',
    details: '',
    priority: '',
    assignedTo: '',
    schedule: {
      isAllDay: false,
      startDate: '',
      time: '',
      interval: 1,
      intervalUnit: 'day',
      endType: 'never',
      endDate: '',
      occurrences: 1
    },
    files: []
  }
  selectedFiles.value = []
  selectedTab.value = 'location'
}

const close = () => {
  resetForm()
  emit('close')
}
</script>

<style scoped>
.form-tabs {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
}

.form-content {
  padding: 20px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recurrence-section {
  padding-left: 16px;
  margin-top: 8px;
}

.interval-input {
  max-width: 80px;
  text-align: center;
  margin-right: 8px;
}

.interval-unit {
  min-width: 100px;
}

.form-navigation {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.file-upload {
  width: 100%;
}

.file-input {
  display: none;
}

.file-preview {
  margin-top: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-item ion-icon {
  font-size: 24px;
}

@media (max-width: 768px) {
  .form-tabs {
    overflow-x: auto;
  }

  .form-content {
    padding: 16px;
  }

  .interval-input {
    max-width: 60px;
  }

  .interval-unit {
    min-width: 80px;
  }
}
</style>
