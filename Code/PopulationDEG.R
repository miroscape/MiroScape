# Load necessary packages
library(ggplot2)
library(ggrepel)

# Read CSV file (TCGA differential genes)
res <- read.csv('/Users/duze/Desktop/WangLab/Data/TCGA_GBM_vs_Brain.csv', 
                stringsAsFactors = FALSE)

# Prepare plot data
plot_data <- data.frame(
  gene = res$name,               
  log2FC = res$log2FC,           
  pvalue = res$p.value,          
  qvalue = res$q.value,          
  baseMean = res$aveEXP,         
  stringsAsFactors = FALSE
)

# Handle missing values and special cases
plot_data <- na.omit(plot_data)

min_p <- .Machine$double.eps  
plot_data$pvalue[plot_data$pvalue <= 0] <- min_p
plot_data <- plot_data[is.finite(plot_data$log2FC), ]
plot_data$negLog10P <- -log10(plot_data$pvalue)

# Set thresholds
pvalue_threshold <- 0.05
log2FC_threshold <- 1

# Label DEGs
plot_data$diffexpressed <- "NO"
plot_data$diffexpressed[plot_data$log2FC > log2FC_threshold & plot_data$pvalue < pvalue_threshold] <- "UP"
plot_data$diffexpressed[plot_data$log2FC < -log2FC_threshold & plot_data$pvalue < pvalue_threshold] <- "DOWN"

# Select top 20 by p-value
top_genes <- 20
plot_data <- plot_data[order(plot_data$pvalue), ]
plot_data$delabel <- NA
plot_data$delabel[1:top_genes] <- plot_data$gene[1:top_genes]

# ===== interactive input gene =====
target_gene <- readline(prompt = "Enter gene to highlight (e.g., PARP11): ")
target_gene <- trimws(target_gene)

if (target_gene %in% plot_data$gene) {
  idx_target <- which(plot_data$gene == target_gene)
  if (is.na(plot_data$delabel[idx_target])) {
    plot_data$delabel[idx_target] <- target_gene
  }
  cat("\nData for", target_gene, ":\n")
  print(plot_data[idx_target, ])
} else {
  cat("\nGene not found in dataset.\n")
}

# Create volcano plot (no change except removing ggsave)
p <- ggplot(plot_data, aes(x = log2FC, y = negLog10P, col = diffexpressed, label = delabel)) +
  geom_point(size = 1, alpha = 0.7) +
  theme_minimal(base_size = 12) +
  scale_color_manual(
    name = "DEG",
    values = c("UP" = "red2", "DOWN" = "blue2", "NO" = "gray70"),
    drop = FALSE
  ) +
  scale_size_continuous(range = c(0.5, 5), guide = "none") +
  geom_vline(xintercept = c(-log2FC_threshold, log2FC_threshold), 
             linetype = "dashed", color = "black", linewidth = 0.5) +
  geom_hline(yintercept = -log10(pvalue_threshold), 
             linetype = "dashed", color = "black", linewidth = 0.5) +
  labs(
    x = expression(log[2]("Fold Change")), 
    y = expression(-log[10]("P-value")), 
    title = "TCGA Glioma vs GTEx Brain Cortex: Cancer vs Normal",
    caption = paste("Up:", sum(plot_data$diffexpressed == "UP"), 
                    "| Down:", sum(plot_data$diffexpressed == "DOWN"))
  ) +
  geom_text_repel(
    size = 3.5,
    max.overlaps = 30,
    min.segment.length = 0.1,
    box.padding = 0.5,
    color = "black",
    segment.color = "grey40"
  ) +
  theme(
    legend.position = "bottom",
    plot.title = element_text(hjust = 0.5, face = "bold"),
    panel.grid = element_line(linewidth = 0.2),
    axis.line = element_line(color = "black")
  ) +
  coord_cartesian(clip = "off")

print(p)