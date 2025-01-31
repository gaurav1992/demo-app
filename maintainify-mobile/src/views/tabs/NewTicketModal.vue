<!-- NewTicketModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>New Reactive Ticket</ion-title>
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
                placeholder="Enter ticket details..."
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
            <ion-item>
              <ion-label position="stacked">Frequency</ion-label>
              <ion-select v-model="formData.frequency" @ionChange="handleFrequencyChange">
                <ion-select-option value="once">One Time</ion-select-option>
                <ion-select-option value="daily">Daily</ion-select-option>
                <ion-select-option value="weekly">Weekly</ion-select-option>
                <ion-select-option value="monthly">Monthly</ion-select-option>
                <ion-select-option value="custom">Custom</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Date</ion-label>
              <ion-datetime 
                v-model="formData.date"
                presentation="date"
                :min="minDate"
              ></ion-datetime>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Time</ion-label>
              <ion-datetime 
                v-model="formData.time"
                presentation="time"
              ></ion-datetime>
            </ion-item>

            <!-- Custom recurring options if needed -->
            <div v-if="formData.frequency === 'custom'" class="custom-recurring">
              <!-- Add custom recurring options here -->
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
            Submit Ticket
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
  closeOutline,
  cloudUploadOutline,
  documentOutline,
  closeCircleOutline
} from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close', 'save'])

const tabs = ['location', 'category', 'details', 'assign', 'schedule', 'media']
const selectedTab = ref('location')
const selectedFiles = ref<File[]>([])

const formData = ref({
  building: '',
  location: '',
  asset: '',
  category: '',
  title: '',
  details: '',
  priority: '',
  assignedTo: '',
  frequency: 'once',
  date: '',
  time: '',
  files: [] as File[]
})

// Computed properties for tab navigation
const currentTabIndex = computed(() => tabs.indexOf(selectedTab.value))
const isFirstTab = computed(() => currentTabIndex.value === 0)
const isLastTab = computed(() => currentTabIndex.value === tabs.length - 1)

// Navigation methods
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

// File handling methods
const fileInput = ref<HTMLInputElement | null>(null)

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

// Form submission
const handleSubmit = () => {
  emit('save', formData.value)
  emit('close')
}

// Close modal
const close = () => {
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
}
</style>
